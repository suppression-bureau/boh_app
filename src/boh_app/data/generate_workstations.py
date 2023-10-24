from typing import Any

from .gen_utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file


def gen_workstation_json():
    data = mk_model_data()
    write_gen_file("workstation", data)


def mk_model_data() -> list[dict[str, Any]]:
    data = get_steam_data(SteamFiles.WORKSTATION)
    ws_handler = WorkstationHandler()
    data = [d for d in data if "bed" not in d["id"]]  # beds, HUH, yeah~ what are they good for?
    return [ws_handler.mk_model_data(d) for d in data]


class WorkstationHandler:
    def __init__(self):
        self.valid_types = get_valid_refs("workstation_type")
        self.valid_types.remove("generic")
        self.principles = get_valid_refs("principle")
        self.known_slots = set()

    def get_principles(self, item: dict[str, Any]) -> list[dict[str, Any]]:
        principles = item["hints"]
        assert all(p in self.principles for p in principles)
        return [{"id": p} for p in principles]

    def get_type(self, item: dict[str, Any]) -> dict[str, Any]:
        for label in self.valid_types:
            if label in item["id"]:
                return {"id": label}
        return {"id": "generic"}

    def mk_model_data(self, item: dict[str, Any]) -> dict[str, Any]:
        model = {
            "id": item["label"],
            "principles": self.get_principles(item),
            "workstation_type": self.get_type(item),
        }

        return model
