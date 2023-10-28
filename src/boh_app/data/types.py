from __future__ import annotations

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


class Principle(TypedDict):
    id: str


class Wisdom(TypedDict):
    id: str


class WorkstationType(TypedDict):
    id: str


class Aspect(TypedDict):
    id: str


class Item(TypedDict):
    id: str
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