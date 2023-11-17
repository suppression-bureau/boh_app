from typing import Any, cast

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema, fields
from marshmallow_sqlalchemy import ModelConverter as BaseModelConverter
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import ColumnProperty, DeclarativeBase, Mapper, Session
from sqlalchemy_utils import get_mapper

from ..data.types_sqla import TypedList


class ModelConverter(BaseModelConverter):
    # TODO: replace all this with a custom Field
    def _get_typed_list(self, prop: ColumnProperty) -> TypedList | None:
        if not hasattr(prop, "columns") or len(prop.columns) != 1:
            return None
        [col] = prop.columns
        if isinstance(col.type, TypedList):
            return col.type
        return None

    def _get_field_class_for_property(self, prop: ColumnProperty):
        if hasattr(prop, "direction"):
            return Related
        return super()._get_field_class_for_property(prop)

    def _get_field_kwargs_for_property(self, prop: ColumnProperty) -> dict[str, Any]:
        # TODO: replace with prop.info = {"marshmallow": { ... }}
        if tl := self._get_typed_list(prop):
            [col] = prop.columns
            mapper = cast(Mapper, get_mapper(col))
            sqla_type = mapper.registry._resolve_type(tl.coerce_func)
            inner_field_type = self._get_field_class_for_data_type(sqla_type)
            return {"class_or_instance": inner_field_type}
        return super()._get_field_kwargs_for_property(prop)


class Related(fields.Related):
    def _get_existing_instance(self, related_model, value):
        lookup_values = [value.get(prop.key) for prop in self.related_keys]
        if None in lookup_values:
            raise NoResultFound
        return super()._get_existing_instance(related_model, value)


def sqlalchemy_to_marshmallow(class_: type[DeclarativeBase], *, session: Session) -> type[SQLAlchemyAutoSchema]:
    if class_.__name__.endswith("Schema"):
        raise ModelConversionError("For safety, setup_schema can not be used when a Model class ends with 'Schema'")

    class Meta:
        model = class_
        model_converter = ModelConverter
        sqla_session = session
        include_relationships = True
        load_instance = True
        # include_fk = True # seems to override include_relationships

    schema_class_name = f"{class_.__name__}Schema"

    # default fields defined by model.mapper.attrs:
    # https://docs.sqlalchemy.org/en/20/orm/mapping_api.html#sqlalchemy.orm.Mapper.attrs
    # TODO: make it work loop order independent
    additional_fields = getattr(class_, "_additional_fields", lambda: {})()
    schema_class = type(schema_class_name, (SQLAlchemyAutoSchema,), {"Meta": Meta, **additional_fields})

    return schema_class
