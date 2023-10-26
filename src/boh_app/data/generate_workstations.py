from typing import Any

from .types import Aspect, Principle, Slot, Wisdom, Workstation, WorkstationType
from .utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file


def gen_workstation_json():
    ws_data, slot_data = mk_model_data()
    write_gen_file("workstation_slot", slot_data)
    write_gen_file("workstation", ws_data)


def mk_model_data() -> tuple[list[Workstation], list[Slot]]:
    ws_handler = WorkstationHandler()
    data = [d for d in get_steam_data(SteamFiles.WORKSTATION) if "bed" not in d["id"]]
    workstation_data = [ws_handler.mk_model_data(d) for d in data]
    slot_data = ws_handler.slot_handler.full_slots
    return workstation_data, slot_data


class SlotHandler:
    def __init__(self):
        self.aspects = get_valid_refs("aspect")
        self.known_slots: dict[str, list[str]] = {}
        self.full_slots: list[Slot] = []

    def _get_aspects(self, item_slot: dict[str, Any]) -> list[str]:
        aspects: dict[str, Any] = item_slot.get("essential") or item_slot.get("required") or {}
        if "ability" in aspects:
            aspects.pop("ability")
            aspects["soul"] = 1
        return [a for a in aspects if a in self.aspects]

    def get_slot(self, item_slot: dict[str, Any], workstation_name: str, index: int) -> Slot:
        aspects = self._get_aspects(item_slot)
        id = name = item_slot["label"]

        if id in self.known_slots:
            if aspects == self.known_slots[id]:
                return Slot(id=id, name=name, index=index)
            id = f"{workstation_name}.{id}"
            if id in self.known_slots:
                id += "2"

        self.known_slots[id] = aspects
        self.full_slots.append(Slot(id=id, name=name, index=index, accepts=[Aspect(id=a) for a in aspects]))
        return Slot(id=id, name=name, index=index)


class WorkstationHandler:
    def __init__(self):
        self.principles = get_valid_refs("principle")
        self.wisdoms = get_valid_refs("wisdom")
        self.valid_types = get_valid_refs("workstation_type")
        self.slot_handler = SlotHandler()

    def get_principles(self, item: dict[str, Any]) -> list[Principle]:
        principles = item["hints"]
        assert all(p in self.principles for p in principles)
        return [Principle(id=p) for p in principles]

    def get_wisdom(self, item: dict[str, Any]) -> Wisdom | None:
        aspects = {a.split(".")[1].capitalize(): v for a, v in item["aspects"].items() if "." in a}
        for wisdom in self.wisdoms:
            if wisdom in aspects:
                return Wisdom(id=wisdom)
        return None

    def get_type(self, item: dict[str, Any]) -> WorkstationType:
        for label in self.valid_types:
            if label in item["id"]:
                return WorkstationType(id=label)
        return WorkstationType(id="generic")

    def get_slots(self, item: dict[str, Any]) -> list[Slot]:
        return [self.slot_handler.get_slot(slot, item["label"], index) for index, slot in enumerate(item["slots"])]

    def mk_model_data(self, item: dict[str, Any]) -> Workstation:
        model = Workstation(
            id=item["label"],
            principles=self.get_principles(item),
            workstation_type=self.get_type(item),
            workstation_slots=self.get_slots(item),
        )
        if wisdom := self.get_wisdom(item):
            model["evolves"] = wisdom

        return model
