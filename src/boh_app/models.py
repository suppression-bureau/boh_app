from __future__ import annotations

from typing import TYPE_CHECKING, ClassVar, cast

from marshmallow_sqlalchemy.fields import Nested
from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, object_session, registry, relationship

if TYPE_CHECKING:
    from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

reg = registry()


class Base(DeclarativeBase):
    registry = reg
    # added in serializers.py
    __marshmallow__: ClassVar[type[SQLAlchemyAutoSchema]]


def get_tablename_model_mapping() -> dict[str, type[Base]]:
    registry = Base.registry._class_registry
    models = [cast(type[Base], m) for k, m in registry.items() if not k.startswith("_")]
    tablename_model_mapping = {m.__tablename__: m for m in models}
    return tablename_model_mapping


def get_model_by_tablename(name: str) -> type[Base]:
    tablename_model_mapping = get_tablename_model_mapping()
    return tablename_model_mapping[name]


class IdMixin:
    id: Mapped[int] = mapped_column(primary_key=True)


class NameMixin:
    id: Mapped[str] = mapped_column(primary_key=True)


item_aspect_association = Table(
    "item_aspect",
    Base.metadata,
    Column("aspect_id", ForeignKey("aspect.id"), primary_key=True),
    Column("item_id", ForeignKey("item.id"), primary_key=True),
)

workstation_principle_association = Table(
    "workstation_principle",
    Base.metadata,
    Column("workstation_id", ForeignKey("workstation.id"), primary_key=True),
    Column("principle_id", ForeignKey("principle.id"), primary_key=True),
)

workstation_slot_aspect_association = Table(
    "workstation_slot_aspect",
    Base.metadata,
    Column("workstation_slot_id", ForeignKey("workstation_slot.id"), primary_key=True),
    Column("aspect_id", ForeignKey("aspect.id"), primary_key=True),
)

workstation_slot_workstation_association = Table(
    "workstation_slot_workstation",
    Base.metadata,
    Column("workstation_slot_id", ForeignKey("workstation_slot.id"), primary_key=True),
    Column("workstation_id", ForeignKey("workstation.id"), primary_key=True),
)

recipe_skill_association = Table(
    "recipe_skill",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipe.id"), primary_key=True),
    Column("skill_id", ForeignKey("skill.id"), primary_key=True),
)

assistant_principle_count_association = Table(
    "assistant_principle_count",
    Base.metadata,
    Column("assistant_id", ForeignKey("assistant.id"), primary_key=True),
    Column("principle_count_id", ForeignKey("principle_count.id"), primary_key=True),
)


class Aspect(Base, NameMixin):
    __tablename__ = "aspect"

    items: Mapped[list[Item]] = relationship(back_populates="aspects", secondary=item_aspect_association)
    assistants: Mapped[list[Assistant]] = relationship(back_populates="special_aspect")


class Principle(Base, NameMixin):
    __tablename__ = "principle"

    primary_skills: Mapped[list[Skill]] = relationship(
        back_populates="primary_principle", primaryjoin="Skill.primary_principle_id==Principle.id"
    )
    secondary_skills: Mapped[list[Skill]] = relationship(
        back_populates="secondary_principle", primaryjoin="Skill.secondary_principle_id==Principle.id"
    )

    workstations: Mapped[list[Workstation]] = relationship(back_populates="principles", secondary=workstation_principle_association)


class PrincipleCount(Base, IdMixin):
    __tablename__ = "principle_count"
    # __table_args__ = (UniqueConstraint("principle_id", "count"),) Doesn't work with data loader, IntegrityError

    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    principle: Mapped[Principle] = relationship()

    count: Mapped[int]

    assistants: Mapped[list[Assistant]] = relationship(back_populates="base_principles", secondary=assistant_principle_count_association)


class Wisdom(Base, NameMixin):
    __tablename__ = "wisdom"


class Skill(Base, NameMixin):
    __tablename__ = "skill"

    @classmethod
    def _additional_fields(cls):
        return {"wisdoms": Nested(Wisdom.__marshmallow__, many=True)}

    primary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    primary_principle: Mapped[Principle] = relationship(back_populates="primary_skills", foreign_keys=[primary_principle_id])

    secondary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    secondary_principle: Mapped[Principle] = relationship(back_populates="secondary_skills", foreign_keys=[secondary_principle_id])

    # could also just make wisdoms MANYTOMANY? numerical assignment is arbitrary
    wisdom_1_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_1: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_1_id])

    wisdom_2_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_2: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_2_id])

    @hybrid_property
    def wisdoms(self) -> list[Wisdom]:
        return [self.wisdom_1, self.wisdom_2]

    recipes: Mapped[list[Recipe]] = relationship(back_populates="skills", secondary=recipe_skill_association)


class Item(Base, NameMixin):
    __tablename__ = "item"

    aspects: Mapped[list[Aspect]] = relationship(back_populates="items", secondary=item_aspect_association)

    # principles
    edge: Mapped[int | None]
    forge: Mapped[int | None]
    grail: Mapped[int | None]
    heart: Mapped[int | None]
    knock: Mapped[int | None]
    lantern: Mapped[int | None]
    moon: Mapped[int | None]
    moth: Mapped[int | None]
    nectar: Mapped[int | None]
    rose: Mapped[int | None]
    scale: Mapped[int | None]
    sky: Mapped[int | None]
    winter: Mapped[int | None]

    is_craftable: Mapped[bool] = mapped_column(default=False)

    source_recipe: Mapped[list[Recipe]] = relationship(back_populates="product", primaryjoin="Item.id==Recipe.product_id")
    product_recipe: Mapped[list[Recipe]] = relationship(back_populates="source", primaryjoin="Item.id==Recipe.source_id")


class SkillLevel(Base, IdMixin):
    __tablename__ = "skill_level"

    skill_id: Mapped[int] = mapped_column(ForeignKey("skill.id"))
    # skill: Mapped[Skill] = relationship(back_populates="skill_level")
    level: Mapped[int]


class Recipe(Base, IdMixin):
    __tablename__ = "recipe"

    product_id: Mapped[int] = mapped_column(ForeignKey("item.id"))
    product: Mapped[Item] = relationship(back_populates="source_recipe", foreign_keys=[product_id])

    source_id: Mapped[int | None] = mapped_column(ForeignKey("item.id"))
    source: Mapped[Item] = relationship(back_populates="product_recipe", foreign_keys=[source_id])

    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    principle: Mapped[Principle] = relationship()

    principle_amount: Mapped[int]

    skills: Mapped[list[Skill]] = relationship(back_populates="recipes", secondary=recipe_skill_association)


class WorkstationType(Base, NameMixin):
    __tablename__ = "workstation_type"

    workstations: Mapped[list[Workstation]] = relationship(back_populates="workstation_type")


class WorkstationSlot(Base, IdMixin):
    __tablename__ = "workstation_slot"

    name: Mapped[str]

    workstations: Mapped[list[Workstation]] = relationship(
        back_populates="workstation_slots",
        secondary=workstation_slot_workstation_association,
    )

    accepts: Mapped[list[Aspect]] = relationship(secondary=workstation_slot_aspect_association)


class Workstation(Base, NameMixin):
    __tablename__ = "workstation"

    @classmethod
    def _additional_fields(cls):
        return {"workstation_slots": Nested(WorkstationSlot.__marshmallow__, many=True)}

    workstation_type_id: Mapped[str] = mapped_column(ForeignKey("workstation_type.id"))
    workstation_type: Mapped[WorkstationType] = relationship(back_populates="workstations")

    # TODO: slots load first, meaning that we cannot name workstations on slots (lacking data, or repeated data), but
    # slots are also not able to be called by .name, so we also cannot name slots on workstations
    workstation_slots: Mapped[list[WorkstationSlot]] = relationship(
        back_populates="workstations",
        secondary=workstation_slot_workstation_association,
    )
    wisdom_id: Mapped[int | None] = mapped_column(ForeignKey("wisdom.id"))
    evolves: Mapped[Wisdom | None] = relationship()

    principles: Mapped[list[Principle]] = relationship(
        back_populates="workstations",
        secondary=workstation_principle_association,
    )


class Assistant(Base, NameMixin):
    __tablename__ = "assistant"

    @classmethod
    def _additional_fields(cls):
        return {"accepted_aspects": Nested(Aspect.__marshmallow__, many=True)}

    base_aspects: ClassVar = frozenset(["sustenance", "beverage", "memory", "tool", "device"])

    season: Mapped[str | None]
    aspect_id = mapped_column(ForeignKey("aspect.id"))
    special_aspect: Mapped[Aspect] = relationship(back_populates="assistants")
    base_principles: Mapped[list[PrincipleCount]] = relationship(
        back_populates="assistants", secondary=assistant_principle_count_association
    )

    @hybrid_property
    def accepted_aspects(self) -> list[Aspect]:
        db_session = object_session(self)
        assert db_session
        base_aspects = db_session.query(Aspect).filter(Aspect.id.in_(self.base_aspects)).all()
        return [self.special_aspect, *base_aspects]
