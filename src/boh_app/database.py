from typing import List, Optional

from sqlalchemy import create_engine
from sqlalchemy import ForeignKey
from sqlalchemy.orm import registry, DeclarativeBase, Mapped, mapped_column, relationship

reg = registry()
class Base(DeclarativeBase):
    registry = reg
    pass
    
engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)

class Aspect(Base):
    __tablename__ = "aspect"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    items: Mapped[List["ItemAspect"]] = relationship(back_populates="aspect")
  
    def __repr__(self) -> str:
        return f"Type(id={self.id!r}, name={self.name!r})"

class Principle(Base):
    __tablename__ = "principle"
   
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    
    primary_skills: Mapped[List["Skill"]] = relationship(
        back_populates="primary_principle",
        primaryjoin="Skill.primary_principle_id==Principle.id"
    )
    secondary_skills: Mapped[List["Skill"]] = relationship(
        back_populates="secondary_principle",
        primaryjoin="Skill.secondary_principle_id==Principle.id"
    )

    workstations: Mapped[List["WorkstationPrinciple"]] = relationship(back_populates="principle")

   
class Wisdom(Base):
    __tablename__ = "wisdom"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

class Skill(Base):
    __tablename__ = "skill"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    
    primary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    primary_principle: Mapped[Principle] = relationship(
        back_populates="primary_skills",
        foreign_keys=[primary_principle_id]
    )
    
    secondary_principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    secondary_principle: Mapped[Principle] = relationship(
        back_populates="secondary_skills",
        foreign_keys=[secondary_principle_id]
    )
    
    wisdom_1_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_1: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_1_id])
    
    wisdom_2_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    wisdom_2: Mapped[Wisdom] = relationship(foreign_keys=[wisdom_2_id])

    recipes: Mapped[List["RecipeSkill"]] = relationship(back_populates="skill")

class ItemAspect(Base): # Association Table

    __tablename__ = "item_aspect"
    
    aspect_id: Mapped[int] = mapped_column(ForeignKey("aspect.id"), primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"), primary_key=True)

    aspect: Mapped[Aspect] = relationship(back_populates="items")
    item: Mapped["Item"] = relationship(back_populates="aspects")

class Item(Base):
    __tablename__ = "item"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
   
    aspects: Mapped[List["ItemAspect"]] = relationship(back_populates="item")
   
    # principles   
    edge: Mapped[Optional[int]]
    forge: Mapped[Optional[int]]
    grail: Mapped[Optional[int]]
    heart: Mapped[Optional[int]]
    knock: Mapped[Optional[int]]
    lantern: Mapped[Optional[int]]
    moon: Mapped[Optional[int]]
    moth: Mapped[Optional[int]]
    nectar: Mapped[Optional[int]]
    rose: Mapped[Optional[int]]
    scale: Mapped[Optional[int]]
    sky: Mapped[Optional[int]]
    winter: Mapped[Optional[int]]
    
    is_craftable: Mapped[bool] = mapped_column(default=False)

    source_recipe: Mapped[List["Recipe"]] = relationship(
        back_populates="product",
        primaryjoin="Item.id==Recipe.product_id"
    )
    product_recipe: Mapped[List["Recipe"]] = relationship(
        back_populates="source",
        primaryjoin="Item.id==Recipe.source_id"
)

class SkillLevel(Base):
    __tablename__ = "skill_level"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skill.id"))
    # skill: Mapped[Skill] = relationship(back_populates="skill_level")
    level: Mapped[int]

class Recipe(Base):
    __tablename__ = "recipe"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    
    product_id: Mapped[int] =mapped_column(ForeignKey("item.id"))
    product: Mapped[Item] = relationship(back_populates="source_recipe", foreign_keys=[product_id])
    
    source_id: Mapped[Optional[int]] = mapped_column(ForeignKey("item.id"))
    source: Mapped[Item] = relationship(back_populates="product_recipe", foreign_keys=[source_id])
    
    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"))
    principle: Mapped[Principle] = relationship()
    
    principle_amount: Mapped[int]

    skills: Mapped[List["RecipeSkill"]] = relationship(back_populates="recipe")

class RecipeSkill(Base): # Association table
    __tablename__ = "recipe_skill"
    
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skill.id"), primary_key=True)

    recipe: Mapped[Recipe] = relationship(back_populates="skills")
    skill: Mapped[Skill] = relationship(back_populates="recipes")

# is this necessary? 
# class WorkstationType(Base):
#     __tablename__ = "workstation_type"
    
#     id: Mapped[int] = mapped_column(primary_key=True)
#     name: Mapped[str]
#     workstations: Mapped[List["Workstation"]] = relationship(back_populates="workstation_type")

class WorkstationSlot(Base):
    __tablename__ = "workstation_slot"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    accepted_aspect_id: Mapped[List[int]] = mapped_column(ForeignKey("aspect.id"))
    accepts: Mapped[List[Aspect]] = relationship()

class Workstation(Base):
    __tablename__ = "workstation"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    # workstation_type_id: Mapped[int] = mapped_column(ForeignKey("workstation_type.id"))
    # workstation_type: Mapped[WorkstationType] = relationship(back_populates="workstations")

    wisdom_id: Mapped[int] = mapped_column(ForeignKey("wisdom.id"))
    evolves: Mapped[Wisdom] = relationship()

    principles: Mapped[List["WorkstationPrinciple"]] = relationship(back_populates="workstation")

class WorkstationPrinciple(Base): # Association Table
    __tablename__ = "workstation_principle"
    
    workstation_id: Mapped[int] = mapped_column(ForeignKey("workstation.id"), primary_key=True)
    principle_id: Mapped[int] = mapped_column(ForeignKey("principle.id"), primary_key=True)

    workstation: Mapped[Workstation] = relationship(back_populates="principles")
    principle: Mapped[Principle] = relationship(back_populates="workstations")
