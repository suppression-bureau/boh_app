from __future__ import annotations

from enum import StrEnum, auto
from typing import NotRequired, TypedDict


class Workstation(TypedDict):
    id: str
    principles: list[Principle]
    workstation_type: WorkstationType
    workstation_slots: list[Slot]
    evolves: NotRequired[Wisdom]


class Slot(TypedDict):
    id: str
    name: str
    index: int
    accepts: NotRequired[list[Aspect]]


class Principle(StrEnum):
    edge = auto()
    forge = auto()
    grail = auto()
    heart = auto()
    knock = auto()
    lantern = auto()
    moon = auto()
    moth = auto()
    nectar = auto()
    rose = auto()
    scale = auto()
    sky = auto()
    winter = auto()


class CraftingAction(StrEnum):
    craft = auto()
    read = auto()


class Wisdom(TypedDict):
    id: str


class WorkstationType(TypedDict):
    id: str


class Aspect(TypedDict):
    id: str


class Item(TypedDict):
    id: str
    name: str
    aspects: NotRequired[list[Aspect]]
    known: NotRequired[bool]
    edge: NotRequired[int]
    forge: NotRequired[int]
    grail: NotRequired[int]
    heart: NotRequired[int]
    knock: NotRequired[int]
    lantern: NotRequired[int]
    moon: NotRequired[int]
    moth: NotRequired[int]
    nectar: NotRequired[int]
    rose: NotRequired[int]
    scale: NotRequired[int]
    sky: NotRequired[int]
    winter: NotRequired[int]


class Skill(TypedDict):
    id: str
    name: str
    primary_principle: Principle
    secondary_principle: Principle
    wisdoms: list[Wisdom]


class ItemRef(TypedDict):
    id: str


class SkillRef(TypedDict):
    id: str


class RecipeInternal(TypedDict):
    id: str


class Recipe(TypedDict):
    id: str
    product: ItemRef
    source_aspect: NotRequired[Aspect]
    source_item: NotRequired[ItemRef]
    principle: Principle
    principle_amount: int
    skills: NotRequired[list[SkillRef]]
    recipe_internals: NotRequired[list[RecipeInternal]]
    crafting_action: CraftingAction


class KnownSkill(TypedDict):
    id: str
    level: int
    committed_wisdom: NotRequired[Wisdom]
    evolvable_soul: NotRequired[ItemRef]


class KnownRecipe(TypedDict):
    id: str
    skills: NotRequired[list[SkillRef]]  # irrelevant for books, i.e. we're not tracking languages


class ProcessedAutosave(TypedDict):
    items: list[ItemRef]
    skills: list[KnownSkill]
    recipes: list[KnownRecipe]
