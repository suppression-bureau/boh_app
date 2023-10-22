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
    model_data = [make_model_data(item) for item in data]
    model_data = dedup(model_data)
    with (CACHE_DIR / "item.json").open("w") as a:
        json.dump(model_data, a)


def get_steam_data(selection: SteamFiles) -> list[dict[str, Any]]:
    boh_data_dir = find_boh_dir() / "StreamingAssets/bhcontent/core/elements"
    boh_file = boh_data_dir / selection.value

    with boh_file.open() as a:
        data = json.load(a)
    return data["elements"]


def prune_data(data: list[dict[str, Any]]):
    # TODO: handle beasts
    discarded = ["beast", "comfort", "bust", "cache", "spintria", "wallart"]
    pruned = []
    for item in data:
        if any(d in item["inherits"] for d in discarded):
            continue
        if "distributable" in item["aspects"].keys():
            continue
        pruned.append(item)
    return pruned


def get_valid_refs(name: str):
    # TODO: use `load_data.get_data`
    with (HERE / f"{name}.json").open() as a:
        json_data = json.load(a)
        data = [d["id"] for d in json_data]
    return data


def get_our_items():
    with (HERE / "our_items.txt").open() as a:
        data = [d.strip() for d in a.read().split("\n")]
    return data


def make_model_data(item: dict[str, Any]):
    principles = get_valid_refs("principle")
    valid_aspects = get_valid_refs("aspect")

    name = item["Label"].split(" (")[0]
    model = {"id": name}
    model_aspects = []

    for aspect, value in item["aspects"].items():
        if aspect in principles:
            model[aspect] = value
        elif aspect not in valid_aspects:
            continue
        else:
            model_aspects.append(aspect)

    inherits = item["inherits"].split(".")[0].lstrip("_")
    if inherits == "numen":
        model_aspects.append("memory")
    elif inherits in valid_aspects and inherits not in model_aspects:
        model_aspects.append(inherits)
    model["aspects"] = [{"id": a} for a in model_aspects]

    our_items = get_our_items()
    if name in our_items:
        model["known"] = True
    return model


def dedup(items: list[dict[str, Any]]):
    seen = set()
    return [item for item in items if item["id"] not in seen and not seen.add(item["id"])]
