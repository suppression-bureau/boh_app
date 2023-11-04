from pathlib import Path
from typing import Any

from .types import Aspect, ItemRef, Principle, Recipe, SkillRef
from .utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file

HERE = Path(__file__).parent


def gen_recipes_json():
    data = get_steam_data(SteamFiles.RECIPE_KEEPER)
    data += get_steam_data(SteamFiles.RECIPE_SCHOLAR)
    data += get_steam_data(SteamFiles.RECIPE_PRENTICE)
    handler = RecipeHandler()
    [handler.mk_model_data(d) for d in data]
    model_data = list(handler.recipe_map.values())
    write_gen_file("recipe", model_data)


class RecipeHandler:
    def __init__(self):
        self.principles = get_valid_refs("principle")
        self.skills = get_valid_refs("skill")
        self.items = get_valid_refs("item")
        self.aspects = get_valid_refs("aspect")
        self.recipe_map = {}

    def _get_product(self, recipe: dict[str, Any]) -> ItemRef:
        product = recipe["effects"]
        for k, _ in product.items():
            if k in self.items:
                return ItemRef(id=k)
        raise AssertionError(f"Recipe {recipe['id']} has no product")

    def _get_principle(self, recipe: dict[str, Any]) -> tuple[Principle, int]:
        reqs = recipe["reqs"]
        for k, v in reqs.items():
            if k in self.principles:
                return Principle(id=k), v
        raise AssertionError(f"Recipe {recipe['id']} has no principle")

    def _get_skill(self, recipe: dict[str, Any]) -> SkillRef:
        reqs = recipe["reqs"]
        for k, _ in reqs.items():
            if k in self.skills:
                return SkillRef(id=k)
        raise AssertionError(f"Recipe {recipe['id']} has no skill")

    def _get_source_aspect(self, recipe: dict[str, Any]) -> Aspect | None:
        reqs = recipe["reqs"]
        for k, _ in reqs.items():
            if k in self.aspects:
                return Aspect(id=k)
        return None

    def _get_source_item(self, recipe: dict[str, Any]) -> ItemRef | None:
        reqs = recipe["reqs"]
        for k, _ in reqs.items():
            if k in self.items:
                return ItemRef(id=k)
        return None

    def mk_model_data(self, recipe: dict[str, Any]) -> None:
        principle, amount = self._get_principle(recipe)
        model = Recipe(
            product=self._get_product(recipe),
            principle=principle,
            principle_amount=amount,
            known=False,
        )
        if source_aspect := self._get_source_aspect(recipe):
            model["source_aspect"] = source_aspect
        if source_item := self._get_source_item(recipe):
            model["source_item"] = source_item
        source_key = source_item["id"] if source_item else None
        recipe_key = (model["product"]["id"], source_key, model["principle"]["id"], model["principle_amount"])
        if recipe_key in self.recipe_map:
            self.recipe_map[recipe_key]["skills"].append(self._get_skill(recipe))
        else:
            model["skills"] = [self._get_skill(recipe)]
            self.recipe_map[recipe_key] = model