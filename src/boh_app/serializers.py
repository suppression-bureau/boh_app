"""
sqlalchemy_to_marshmallow is modified from https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
"""
import sys
import warnings
from collections.abc import Container, Generator, Mapping
from functools import reduce
from inspect import get_annotations, signature
from operator import or_
from textwrap import dedent
from types import EllipsisType, ModuleType, UnionType
from typing import ForwardRef, Literal, TypeAlias, Union, get_args, get_origin, overload

from marshmallow_sqlalchemy import ModelConversionError, SQLAlchemyAutoSchema
from pydantic import BaseModel, ConfigDict, create_model
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import DeclarativeBase, Mapped, Session
from sqlalchemy.orm.clsregistry import ClsRegistryToken, _ModuleMarker

PydanticFieldDecl: TypeAlias = tuple[type | UnionType | ForwardRef | None, EllipsisType | None]

SYNTH_MODULE = "_boh_app_synth"


def setup_schema(decl_base: type[DeclarativeBase], *, session: Session, pydantic_bug: bool = True) -> None:
    pydantic_models: dict[type[DeclarativeBase], dict[str, PydanticFieldDecl]] = {}
    for class_ in decl_base.registry._class_registry.values():
        if isinstance(class_, ClsRegistryToken):
            if not isinstance(class_, _ModuleMarker):
                warnings.warn(f"setup_schema does not work with ClsRegistryToken {class_}", stacklevel=2)
            continue
        assert issubclass(class_, DeclarativeBase), class_.mro()

        class_.__marshmallow__ = sqlalchemy_to_marshmallow(class_, session=session)
        if pydantic_bug:
            # TODO: config out of loop
            pydantic_models[class_], config = sqlalchemy_to_pydantic(class_, decl=True)
        else:
            class_.__pydantic__ = sqlalchemy_to_pydantic(class_)

    # only filled if pydantic_bug == True
    for class_, model in render_pydantic_models(pydantic_models, config):
        class_.__pydantic__ = model


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


@overload
def sqlalchemy_to_pydantic(
    db_model: type[DeclarativeBase],
    *,
    config: ConfigDict = ...,
    exclude: Container[str] = ...,
    decl: Literal[True],
) -> tuple[dict[str, PydanticFieldDecl], ConfigDict]:
    ...


@overload
def sqlalchemy_to_pydantic(
    db_model: type[DeclarativeBase],
    *,
    config: ConfigDict = ...,
    exclude: Container[str] = ...,
    decl: Literal[False] = False,
) -> type[BaseModel]:
    ...


def sqlalchemy_to_pydantic(
    db_model: type[DeclarativeBase],
    *,
    config: ConfigDict = orm_config,
    exclude: Container[str] = (),
    decl: bool = False,
) -> type[BaseModel] | tuple[dict[str, PydanticFieldDecl], ConfigDict]:
    simple_fields = dict(convert_simple_fields(db_model, exclude=exclude))
    rel_fields = dict(convert_relationships(db_model, exclude=exclude, pydantic_bug=decl))
    prop_fields = dict(convert_hybrid_properties(db_model, exclude=exclude, pydantic_bug=decl))
    fields = simple_fields | rel_fields | prop_fields

    if decl:
        return fields, config
    else:
        pydantic_model = create_model(db_model.__name__, __config__=config, **fields)
        return pydantic_model


def convert_simple_fields(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = ()
) -> Generator[tuple[str, PydanticFieldDecl], None, None]:
    for name, column in db_model.__table__.columns.items():
        if name in exclude:
            continue
        if column.foreign_keys:
            continue  # skip foreign_id fields
        python_type = column.type.python_type
        if not column.nullable:
            yield name, (python_type, ...)
        else:
            yield name, (python_type | None, None)


def convert_relationships(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = (), pydantic_bug: bool = False
) -> Generator[tuple[str, PydanticFieldDecl], None, None]:
    model_annotations = get_annotations(db_model, eval_str=True)
    for name, mapping in model_annotations.items():
        column = db_model.__table__.columns.get(name)
        if name in exclude:
            continue
        if get_origin(mapping) is not Mapped:
            continue  # skip ClassVars and the like
        if column is not None:
            if not column.foreign_keys:
                continue
            if column.type.python_type in {int, str}:
                continue  # skip foreign_id fields
        [sqla_type] = get_args(mapping)
        python_type, is_nullable = get_python_type(sqla_type, pydantic_bug=pydantic_bug)
        yield name, (python_type, None if is_nullable else ...)


def convert_hybrid_properties(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = (), pydantic_bug: bool = False
) -> Generator[tuple[str, PydanticFieldDecl], None, None]:
    for name, field in vars(db_model).items():
        if name in exclude:
            continue
        if not isinstance(field, hybrid_property):
            continue
        sqla_type: type | UnionType = signature(field.fget, eval_str=True).return_annotation
        python_type, is_nullable = get_python_type(sqla_type, pydantic_bug=pydantic_bug)
        yield name, (python_type, None if is_nullable else ...)


def get_python_type(sqla_type: type | UnionType | None, *, pydantic_bug: bool = False):
    is_nullable = False
    if sqla_types_inner := get_args(sqla_type):
        if None in sqla_types_inner:
            is_nullable = True
        python_types_inner = [get_python_type_inner(t, pydantic_bug=pydantic_bug) for t in sqla_types_inner]
        return list[reduce(or_, python_types_inner)], is_nullable
    else:
        return get_python_type_inner(sqla_type, pydantic_bug=pydantic_bug), is_nullable


def get_python_type_inner(sqla_type: type | None, *, pydantic_bug: bool = False) -> ForwardRef | None:
    if sqla_type in (None, type(None)) or issubclass(sqla_type, str | int):
        return None
    if pydantic_bug:
        return ForwardRef(f"{sqla_type.__name__}FlatModel", module=SYNTH_MODULE)
    else:
        return ForwardRef(f"{sqla_type.__name__}.__pydantic__", module="boh_app.models")


def render_model(class_, fields, *, config: ConfigDict, flat: bool):
    flat_str = "Flat" if flat else ""
    model_code = dedent(
        f"""
        class {class_.__name__}{flat_str}Model(BaseModel):
            model_config = {config!r}
        """
    )
    for field_name, (python_type, default) in fields.items():
        typ = type_str(python_type)
        if flat and "Model" in typ:
            continue
        default_str = "" if default is ... else f" = {default!r}"
        model_code += f"    {field_name}: {typ}{default_str}\n"
    return model_code


def render_pydantic_models(
    model_decls: Mapping[type[DeclarativeBase], Mapping[str, PydanticFieldDecl]],
    config: ConfigDict,
) -> Generator[tuple[type[DeclarativeBase], type[BaseModel]], None, None]:
    module_code = dedent(
        """
        from __future__ import annotations
        from pydantic import BaseModel
        """
    )

    for flat in [True, False]:
        for class_, fields in model_decls.items():
            module_code += render_model(class_, fields, config=config, flat=flat)

    mod = sys.modules[SYNTH_MODULE] = ModuleType(SYNTH_MODULE)
    exec(module_code, mod.__dict__)  # noqa: S102
    for class_ in model_decls:
        yield class_, getattr(mod, f"{class_.__name__}Model")


def type_str(python_type: type | UnionType | ForwardRef | None) -> str:
    if python_type in (None, type(None)):
        return "None"
    if isinstance(python_type, ForwardRef):
        assert python_type.__forward_module__ == SYNTH_MODULE
        return python_type.__forward_arg__
    if get_origin(python_type) in (UnionType, Union):
        return " | ".join(type_str(t) for t in get_args(python_type))
    if get_origin(python_type) is list:
        [python_type_inner] = get_args(python_type)
        return f"list[{type_str(python_type_inner)}]"
    if isinstance(python_type, type):
        return python_type.__name__
    raise AssertionError(f"Unknown type: {python_type!r}")
