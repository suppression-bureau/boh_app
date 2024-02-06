from typing import Any

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema, fields
from marshmallow_sqlalchemy import ModelConverter as BaseModelConverter
from sqlalchemy import Table
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import ColumnProperty, DeclarativeBase, Mapper, Session, mapperlib

from ..data.types_sqla import JsonArray


def find_table_mapper(tbl: Table) -> Mapper:
    mappers = [mapper for reg in mapperlib._all_registries() for mapper in reg.mappers if tbl in mapper.tables]
    if len(mappers) > 1:
        raise ValueError("Multiple mappers found for table '%s'." % tbl.name)
    if not mappers:
        raise ValueError("Could not get mapper for table '%s'." % tbl.name)
    return mappers[0]


class ModelConverter(BaseModelConverter):
    def _get_field_class_for_property(self, prop: ColumnProperty):
        if hasattr(prop, "direction"):
            return Related  # use our custom Related field
        return super()._get_field_class_for_property(prop)

    def _get_field_kwargs_for_property(self, prop: ColumnProperty) -> dict[str, Any]:
        # TODO: replace with prop.info = {"marshmallow": { ... }}
        if tl := _get_typed_list(prop):
            inner_field_type = self._get_field_class_for_data_type(tl)
            return {"metadata": {"class_or_instance": inner_field_type}}
        return super()._get_field_kwargs_for_property(prop)


# TODO: replace all this with a custom Field
def _get_typed_list(prop: ColumnProperty) -> JsonArray | None:
    if not hasattr(prop, "columns") or len(prop.columns) != 1:
        return None
    [col] = prop.columns
    if isinstance(col.type, JsonArray):
        return col.type
    return None


class Related(fields.Related):
    """Patched `Related` field that doesn’t trigger an SQLAlchemy warning."""

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
    additional_fields = getattr(class_, "_additional_fields", dict)()
    schema_class = type(schema_class_name, (SQLAlchemyAutoSchema,), {"Meta": Meta, **additional_fields})

    return schema_class
