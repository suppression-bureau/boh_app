"""
Modified from https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
"""

import warnings
from collections.abc import Container

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema
from pydantic import BaseModel, ConfigDict, create_model
from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy.orm.clsregistry import ClsRegistryToken, _ModuleMarker


def setup_schema(decl_base: type[DeclarativeBase], *, session: Session) -> None:
    for class_ in decl_base.registry._class_registry.values():
        if isinstance(class_, ClsRegistryToken):
            if not isinstance(class_, _ModuleMarker):
                warnings.warn(f"setup_schema does not work with ClsRegistryToken {class_}", stacklevel=2)
            continue
        assert issubclass(class_, DeclarativeBase), class_.mro()

        class_.__marshmallow__ = sqlalchemy_to_marshmallow(class_, session=session)
        class_.__pydantic__ = sqlalchemy_to_pydantic(class_)


def sqlalchemy_to_marshmallow(class_: type[DeclarativeBase], *, session: Session) -> type[SQLAlchemyAutoSchema]:
    if class_.__name__.endswith("Schema"):
        raise ModelConversionError("For safety, setup_schema can not be used when a Model class ends with 'Schema'")

    class Meta:
        model = class_
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


orm_config = ConfigDict(from_attributes=True)


def sqlalchemy_to_pydantic(
    db_model: type[DeclarativeBase],
    *,
    config: ConfigDict = orm_config,
    exclude: Container[str] = [],
) -> type[BaseModel]:
    table = db_model.metadata.tables[db_model.__tablename__]
    fields = {}
    for column in table.columns:
        name = column.name
        if name in exclude:
            continue
        python_type: type | None = None
        if hasattr(column.type, "impl"):
            if hasattr(column.type.impl, "python_type"):
                python_type = column.type.impl.python_type
        elif hasattr(column.type, "python_type"):
            python_type = column.type.python_type
        assert python_type, f"Could not infer python_type for {column}"

        if not column.nullable:
            fields[name] = (python_type, ...)
        else:
            fields[name] = (python_type | None, None)

    pydantic_model = create_model(db_model.__name__, __config__=config, **fields)
    return pydantic_model
