from collections.abc import Container, Generator
from enum import Enum
from functools import reduce
from inspect import get_annotations, signature
from operator import or_
from types import EllipsisType, UnionType
from typing import ForwardRef, TypeAlias, get_args, get_origin

from pydantic import BaseModel, ConfigDict, Field, create_model
from pydantic.fields import FieldInfo
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import DeclarativeBase, Mapped

PydanticFieldDecl: TypeAlias = tuple[type | UnionType | ForwardRef | None, EllipsisType | None]

SYNTH_MODULE = "_boh_app_synth"

orm_config = ConfigDict(from_attributes=True)


def sqlalchemy_to_pydantic(
    db_model: type[DeclarativeBase],
    *,
    config: ConfigDict = orm_config,
    exclude: Container[str] = (),
    flat: bool = False,  # includes FKs when True
    include_relationships: bool = True,
    include_hybrid: bool = True,
) -> type[BaseModel]:
    simple_fields = dict(convert_simple_fields(db_model, exclude=exclude, include_fk=flat))
    fields = simple_fields
    if flat:
        name = f"{db_model.__name__}FlatModel"
    else:
        name = f"{db_model.__name__}Model"
        if include_hybrid:
            prop_fields = dict(convert_hybrid_properties(db_model, exclude=exclude))
            fields = fields | prop_fields
        if include_relationships:
            rel_fields = dict(convert_relationships(db_model, exclude=exclude))
            fields = fields | rel_fields

    pydantic_model = create_model(name, __config__=config, **fields)
    return pydantic_model


def convert_simple_fields(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = (), include_fk: bool = False
) -> Generator[tuple[str, PydanticFieldDecl], None, None]:
    for name, column in db_model.__table__.columns.items():
        if name in exclude:
            continue
        if not include_fk and column.foreign_keys:
            continue  # skip foreign_id fields
        # TODO: TypedList support
        python_type = getattr(db_model, name).type.python_type
        if column.nullable:
            python_type = python_type | None
        yield name, (python_type, get_default(python_type, nullable=column.nullable))


def convert_relationships(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = ()
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
        python_type, is_nullable = get_python_type(sqla_type)
        yield name, (python_type, get_default(python_type, nullable=is_nullable))


def convert_hybrid_properties(
    db_model: type[DeclarativeBase], *, exclude: Container[str] = ()
) -> Generator[tuple[str, PydanticFieldDecl], None, None]:
    for name, field in vars(db_model).items():
        if name in exclude:
            continue
        if not isinstance(field, hybrid_property):
            continue
        sqla_type: type | UnionType = signature(field.fget, eval_str=True).return_annotation
        python_type, is_nullable = get_python_type(sqla_type)
        if sqla_type and not python_type:  # e.g. sqla_type == bool
            python_type = sqla_type
        yield name, (python_type, get_default(python_type, nullable=is_nullable))


def get_python_type(sqla_type: type | UnionType | None):
    is_nullable = False
    if sqla_types_inner := get_args(sqla_type):
        if None in sqla_types_inner:
            is_nullable = True
        python_types_inner = [get_python_type_inner(t) for t in sqla_types_inner]
        python_type_inner = reduce(or_, python_types_inner)
        if get_origin(sqla_type) is list:
            python_type = list[python_type_inner]
        else:
            python_type = python_type_inner
        return python_type, is_nullable
    else:
        return get_python_type_inner(sqla_type), is_nullable


def get_python_type_inner(sqla_type: type | None) -> ForwardRef | type[Enum] | None:
    if sqla_type in (None, type(None)):
        return None
    if issubclass(sqla_type, Enum):
        return sqla_type  # can be StrEnum, so check first
    if issubclass(sqla_type, str | int):
        return None
    return ForwardRef(f"{sqla_type.__name__}FlatModel", module=SYNTH_MODULE)


def get_default(typ: type, *, nullable: bool) -> EllipsisType | None | FieldInfo:
    if nullable:
        return None
    if get_origin(typ) is list:
        return Field(default_factory=list)
    return ...
