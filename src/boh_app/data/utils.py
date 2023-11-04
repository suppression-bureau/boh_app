import json
import logging
from enum import StrEnum
from typing import Any

from ..settings import CACHE_DIR
from ..utils import find_boh_dir
from .types import Item, Recipe, Skill, Slot, Workstation


class SteamFiles(StrEnum):
    ITEM = "elements/aspecteditems.json"
    INHERIT = "elements/_prototypes.json"
    SOUL1 = "elements/abilities.json"
    SOUL2 = "elements/abilities2.json"
    SOUL3 = "elements/abilities3.json"
    SOUL4 = "elements/abilities4.json"
    SKILL = "elements/skills.json"
    WORKSTATION = "verbs/workstations_library_world.json"
    RECIPE_KEEPER = "recipes/crafting_2_keeper.json"
    RECIPE_SCHOLAR = "recipes/crafting_3_scholar.json"
    RECIPE_PRENTICE = "recipes/crafting_4b_prentice.json"


def get_steam_data(selection: SteamFiles) -> list[dict[str, Any]]:
    boh_data_dir = find_boh_dir() / "StreamingAssets/bhcontent/core"
    boh_file = boh_data_dir / selection.value

    with boh_file.open("r") as a:
        data = json.load(a)
    inner = selection.value.split("/")[0]
    return data[inner]


def get_valid_refs(name: str) -> set[str]:
    from boh_app.data.load_data import get_data

    return {d["id"] for d in get_data(name)}


gen_data_types = list[Slot] | list[Workstation] | list[Item] | list[Skill] | list[Recipe]


def write_gen_file(name: str, data: gen_data_types):
    outpath = CACHE_DIR / f"{name}.json"
    logging.info(f"Writing {len(data)} items to {outpath}")

    with outpath.open("w") as a:
        json.dump(data, a)
