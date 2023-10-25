
from pathlib import Path
from typing import Any

from .utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file

HERE = Path(__file__).parent


def gen_items_json():
    data = prune_data(get_steam_data(SteamFiles.ITEM))
    item_handler = ItemHandler()

    model_data = [item_handler.mk_model_data(item) for item in data]
    model_data += [item_handler.mk_model_data(item, inherits=False) for item in get_soul_data()]
    model_data = dedup(model_data)

    write_gen_file("item", model_data)


def get_soul_data():
    soul_items = []
    prune_altered = ["[", ":"]  # e.g. "{soul} [fatigued]" | "{soul}: {disease}"
    for file in [SteamFiles.SOUL1, SteamFiles.SOUL2, SteamFiles.SOUL3, SteamFiles.SOUL4]:
        data = get_steam_data(file)
        for item in data:
            item["aspects"].update({"soul": 1})
            if not item.get("label") or any(d in item["label"] for d in prune_altered):
                continue
            soul_items.append(item)
    return soul_items


def prune_data(data: list[dict[str, Any]]):
    discarded = ["comfort", "bust", "cache", "spintria", "wallart"]
    beast_discarded = [".wild", ".hungry", "savage."]
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

    def mk_model_data(self, item: dict[str, Any], *, inherits: bool = True) -> dict[str, Any]:
        label = "Label" if inherits else "label"

        name = item[label].split(" (")[0]  # e.g. "{drink} (Bottle)" | "{drink} (Half-Full)"
        model = {"id": name}
        model_aspects = []

        for aspect, value in item["aspects"].items():
            if aspect in self.principles:
                model[aspect] = value
            else:
                model_aspects.append(aspect)
        if inherits:
            model_aspects += self.inheritance_handler.get_aspects(item)

        model["aspects"] = [{"id": a} for a in set(model_aspects) if a in self.valid_aspects]

        if name in self.known_items:
            model["known"] = True
        return model


def dedup(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen = set()
    return [item for item in items if item["id"] not in seen and not seen.add(item["id"])]
