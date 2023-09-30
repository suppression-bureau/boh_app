from __future__ import annotations

from sqlalchemy import ForeignKey
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import registry
from sqlalchemy.orm import relationship

reg = registry()


class Base(DeclarativeBase):
    registry = reg
    pass


engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)


class Aspect(Base):
    __tablename__ = "aspect"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    items: Mapped[list[ItemAspect]] = relationship(back_populates="aspect")

    def __repr__(self) -> str:
        return f"Type(id={self.id!r}, name={self.name!r})"


class Principle(Base):
    __tablename__ = "principle"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    primary_skills: Mapped[list[Skill]] = relationship(
        back_populates="primary_principle", primaryjoin="Skill.primary_principle_id==Principle.id"
    )
    secondary_skills: Mapped[list[Skill]] = relationship(
        back_populates="secondary_principle", primaryjoin="Skill.secondary_principle_id==Principle.id"
    )

    workstations: Mapped[list[WorkstationPrinciple]] = relationship(back_populates="principle")


class Wisdom(Base):
    __tablename__ = "wisdom"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]


class Skill(Base):
    __tablename__ = "skill"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    primary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    primary_principle: Mapped[Principle] = relationship(back_populates="primary_skills", foreign_keys=[primary_principle_id])

    secondary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    secondary_principle: Mapped[Principle] = relationship(back_populates="secondary_skills", foreign_keys=[secondary_principle_id])

    wisdom_1_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_1: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_1_id])

    wisdom_2_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_2: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_2_id])

    recipes: Mapped[list[RecipeSkill]] = relationship(back_populates="skill")


class ItemAspect(Base):  # Association Table
    __tablename__ = "item_aspect"

    aspect_id: Mapped[int] = mapped_column(ForeignKey("aspect.id"), primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"), primary_key=True)

    aspect: Mapped[Aspect] = relationship(back_populates="items")
    item: Mapped[Item] = relationship(back_populates="aspects")


class Item(Base):
    __tablename__ = "item"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    aspects: Mapped[list[ItemAspect]] = relationship(back_populates="item")

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


class SkillLevel(Base):
    __tablename__ = "skill_level"

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skill.id"))
    # skill: Mapped[Skill] = relationship(back_populates="skill_level")
    level: Mapped[int]


class Recipe(Base):
    __tablename__ = "recipe"

    id: Mapped[int] = mapped_column(primary_key=True)

    product_id: Mapped[int] = mapped_column(ForeignKey("item.id"))
    product: Mapped[Item] = relationship(back_populates="source_recipe", foreign_keys=[product_id])

    source_id: Mapped[int | None] = mapped_column(ForeignKey("item.id"))
    source: Mapped[Item] = relationship(back_populates="product_recipe", foreign_keys=[source_id])

    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    principle: Mapped[Principle] = relationship()

    principle_amount: Mapped[int]

    skills: Mapped[list[RecipeSkill]] = relationship(back_populates="recipe")


class RecipeSkill(Base):  # Association table
    __tablename__ = "recipe_skill"

    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skill.id"), primary_key=True)

    recipe: Mapped[Recipe] = relationship(back_populates="skills")
    skill: Mapped[Skill] = relationship(back_populates="recipes")


# is this necessary?  maybe enum instead
# class WorkstationType(Base):
#     __tablename__ = "workstation_type"

#     id: Mapped[int] = mapped_column(primary_key=True)
#     name: Mapped[str]
#     workstations: Mapped[List["Workstation"]] = relationship(back_populates="workstation_type")


class WorkstationSlot(Base):
    __tablename__ = "workstation_slot"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    accepted_aspect_id: Mapped[list[int]] = mapped_column(ForeignKey("aspect.id"))
    accepts: Mapped[list[Aspect]] = relationship()


class Workstation(Base):
    __tablename__ = "workstation"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    # workstation_type_id: Mapped[int] = mapped_column(ForeignKey("workstation_type.id"))
    # workstation_type: Mapped[WorkstationType] = relationship(back_populates="workstations")

    wisdom_id: Mapped[int | None] = mapped_column(ForeignKey("wisdom.id"))
    evolves: Mapped[Wisdom | None] = relationship()

    principles: Mapped[list[WorkstationPrinciple]] = relationship(back_populates="workstation")


class WorkstationPrinciple(Base):  # Association Table
    __tablename__ = "workstation_principle"

    workstation_id: Mapped[int] = mapped_column(ForeignKey("workstation.id"), primary_key=True)
    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"), primary_key=True)

    workstation: Mapped[Workstation] = relationship(back_populates="principles")
    principle: Mapped[Principle] = relationship(back_populates="workstations")
