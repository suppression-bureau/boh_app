from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema, fields
from marshmallow_sqlalchemy import ModelConverter as BaseModelConverter
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import DeclarativeBase, Session


class ModelConverter(BaseModelConverter):
    def _get_field_class_for_property(self, prop):
        if hasattr(prop, "direction"):
            return Related
        return super()._get_field_class_for_property(prop)


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
