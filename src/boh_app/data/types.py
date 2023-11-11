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


class PrincipleID(StrEnum):
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


class Principle(TypedDict):
    id: PrincipleID


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
    level: NotRequired[int]
    committed: NotRequired[bool]
    primary_principle: NotRequired[Principle]
    secondary_principle: NotRequired[Principle]
    wisdoms: NotRequired[list[Wisdom]]


class ItemRef(TypedDict):
    id: str


class SkillRef(TypedDict):
    id: str


class Recipe(TypedDict):
    product: ItemRef
    source_aspect: NotRequired[Aspect]
    source_item: NotRequired[ItemRef]
    principle: Principle
    principle_amount: int
    known: bool
    skills: NotRequired[list[SkillRef]]
