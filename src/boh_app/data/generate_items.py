import json
from enum import StrEnum
from pathlib import Path
from typing import Any

from ..settings import CACHE_DIR
from ..utils import find_boh_dir

HERE = Path(__file__).parent


class SteamFiles(StrEnum):
    ITEM = "aspecteditems.json"
    INHERIT = "_prototypes.json"


def gen_items_json():
    data = prune_data(get_steam_data(SteamFiles.ITEM))
    item_handler = ItemHandler()
    model_data = [item_handler.mk_model_data(item) for item in data]
    model_data = dedup(model_data)
    print(CACHE_DIR / "item.json")
    with (CACHE_DIR / "item.json").open("w") as a:
        json.dump(model_data, a)


def get_steam_data(selection: SteamFiles) -> list[dict[str, Any]]:
    boh_data_dir = find_boh_dir() / "StreamingAssets/bhcontent/core/elements"
    boh_file = boh_data_dir / selection.value

    with boh_file.open() as a:
        data = json.load(a)
    return data["elements"]


def prune_data(data: list[dict[str, Any]]):
    discarded = ["comfort", "bust", "cache", "spintria", "wallart"]
    beast_discarded = ["wild", "hungry", "savage"]
    pruned = []
    for item in data:
        if any(d in item["inherits"] for d in discarded):
            continue
        if any(d in item["ID"] for d in beast_discarded):
            continue
        if "distributable" in item["aspects"].keys():
            continue
        pruned.append(item)
    return pruned


def get_valid_refs(name: str):
    from boh_app.data.load_data import get_data

    return [d["id"] for d in get_data(name)]


def get_our_items():
    with (HERE / "our_items.txt").open() as a:
        data = [d.strip() for d in a.read().split("\n")]
    return data


class InheritanceHandler:
    def __init__(self):
        data = get_steam_data(SteamFiles.INHERIT)
        self.data = {i["id"]: i for i in data}

    def get_aspects(self, item: dict[str, Any]):
        inherits_from = self.data[item["inherits"]]
        return inherits_from["aspects"]


class ItemHandler:
    def __init__(self):
        self.principles = get_valid_refs("principle")
        self.valid_aspects = get_valid_refs("aspect")
        self.inheritance_handler = InheritanceHandler()
        self.known_items = get_our_items()

    def mk_model_data(self, item: dict[str, Any]) -> dict[str, Any]:
        name = item["Label"].split(" (")[0]
        model = {"id": name}
        model_aspects = []

        for aspect, value in item["aspects"].items():
            if aspect in self.principles:
                model[aspect] = value
            else:
                model_aspects.append(aspect)
        model_aspects += self.inheritance_handler.get_aspects(item)

        model["aspects"] = [{"id": a} for a in set(model_aspects) if a in self.valid_aspects]

        if name in self.known_items:
            model["known"] = True
        return model


def dedup(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen = set()
    return [item for item in items if item["id"] not in seen and not seen.add(item["id"])]
