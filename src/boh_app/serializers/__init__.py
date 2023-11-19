"""
sqlalchemy_to_marshmallow is modified from https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
"""
import sys
import warnings
from types import ModuleType

from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy.orm.clsregistry import ClsRegistryToken, _ModuleMarker

from ..models import Base, IdMixin
from .marshmallow import sqlalchemy_to_marshmallow
from .pydantic import SYNTH_MODULE, sqlalchemy_to_pydantic


def setup_schema(decl_base: type[DeclarativeBase], *, session: Session) -> None:
    mod = sys.modules[SYNTH_MODULE] = ModuleType(SYNTH_MODULE)

    classes: list[type[Base]] = []
    for class_ in decl_base.registry._class_registry.values():
        if isinstance(class_, ClsRegistryToken):
            if not isinstance(class_, _ModuleMarker):
                warnings.warn(f"setup_schema does not work with ClsRegistryToken {class_}", stacklevel=2)
            continue
        assert issubclass(class_, Base), class_.mro()
        classes.append(class_)

    for class_ in classes:
        pydantic_model = sqlalchemy_to_pydantic(class_, flat=True)
        setattr(mod, pydantic_model.__name__, pydantic_model)

    for class_ in classes:
        class_.__marshmallow__ = sqlalchemy_to_marshmallow(class_, session=session)
        class_.__pydantic__ = sqlalchemy_to_pydantic(class_)

        exclude = ("id",) if issubclass(class_, IdMixin) else ()
        class_.__pydantic_put__ = sqlalchemy_to_pydantic(
            class_, flat=False, include_relationships=True, include_hybrid=False, exclude=exclude
        )
        setattr(mod, class_.__pydantic__.__name__, class_.__pydantic__)
