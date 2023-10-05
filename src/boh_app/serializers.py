"""
Modified from https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
"""

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema


def setup_schema(Base, session):
    for class_ in Base.registry._class_registry.values():
        if not hasattr(class_, "__tablename__"):
            continue

        if class_.__name__.endswith("Schema"):
            raise ModelConversionError("For safety, setup_schema can not be used when a Model class ends with 'Schema'")

        class Meta:
            model = class_
            sqla_session = session
            include_relationships = True
            # include_fk = True # not sure if this is useful(or even makes a difference)
            load_instance = True

        schema_class_name = "%sSchema" % class_.__name__

        schema_class = type(schema_class_name, (SQLAlchemyAutoSchema,), {"Meta": Meta})

        class_.__marshmallow__ = schema_class
