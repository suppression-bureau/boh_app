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
    accepts: NotRequired[list[dict[str, str]]]


class Principle(TypedDict):
    id: str


class Wisdom(TypedDict):
    id: str


class WorkstationType(TypedDict):
    id: str
