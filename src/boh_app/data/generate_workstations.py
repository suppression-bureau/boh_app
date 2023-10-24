from typing import Any

from .gen_utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file


def gen_workstation_json():
    ws_data, slot_data = mk_model_data()
    write_gen_file("workstation_slot", slot_data)
    write_gen_file("workstation", ws_data)


def mk_model_data() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    ws_handler = WorkstationHandler()
    data = [d for d in get_steam_data(SteamFiles.WORKSTATION) if "bed" not in d["id"]]
    workstation_data = [ws_handler.mk_model_data(d) for d in data]
    slot_data = ws_handler.slot_handler.full_slots
    return workstation_data, slot_data


class SlotHandler:
    def __init__(self):
        self.aspects = get_valid_refs("aspect")
        self.known_slots: dict[str, list] = {}
        self.full_slots: list[dict[str, Any]] = []

    def _get_aspects(self, slot: dict[str, Any]) -> list[str]:
        aspects: dict[str, Any] = slot.get("essential") or slot.get("required") or {}
        if "ability" in aspects:
            aspects.pop("ability")
            aspects["soul"] = 1
        return [a for a in aspects if a in self.aspects]

    def get_slot(self, slot: dict[str, Any], workstation_name: str) -> dict[str, Any]:
        aspects = self._get_aspects(slot)
        id = name = slot["label"]

        if id in self.known_slots:
            if aspects == self.known_slots[id]:
                return {"id": id, "name": name}
            id = f"{workstation_name}.{id}"
            if id in self.known_slots:
                id += "2"

        self.known_slots[id] = aspects
        self.full_slots.append({"id": id, "name": name, "accepts": [{"id": a} for a in aspects]})
        return {"id": id, "name": name}


class WorkstationHandler:
    def __init__(self):
        self.valid_types = get_valid_refs("workstation_type")
        self.valid_types.remove("generic")
        self.principles = get_valid_refs("principle")
        self.slot_handler = SlotHandler()

    def get_principles(self, item: dict[str, Any]) -> list[dict[str, Any]]:
        principles = item["hints"]
        assert all(p in self.principles for p in principles)
        return [{"id": p} for p in principles]

    def get_type(self, item: dict[str, Any]) -> dict[str, Any]:
        for label in self.valid_types:
            if label in item["id"]:
                return {"id": label}
        return {"id": "generic"}

    def get_slots(self, item: dict[str, Any]) -> list[dict[str, Any]]:
        return [self.slot_handler.get_slot(s, item["label"]) for s in item["slots"]]

    def mk_model_data(self, item: dict[str, Any]) -> dict[str, Any]:
        model = {
            "id": item["label"],
            "principles": self.get_principles(item),
            "workstation_type": self.get_type(item),
            "workstation_slots": self.get_slots(item),
        }

        return model
