import json
from pathlib import Path
from typing import Any

from .load_data import get_data
from .types import ItemRef, KnownRecipe, KnownSkill, Skill, SkillRef
from .utils import get_valid_refs

AUTOSAVE = Path("/Users/ded/Library/Application Support/Weather Factory/Book of Hours/AUTOSAVE.json")


def load_autosave() -> dict[str, Any]:
    with AUTOSAVE.open() as a:
        data = json.load(a)
    return data


def get_knowns() -> dict[str, Any]:
    data = load_autosave()
    return AutosaveHandler().return_knowns(data)


class AutosaveHandler:
    def __init__(self):
        self.valid_items = get_valid_refs("item")
        self.valid_skills = get_valid_refs("skill")
        self.skill_names_id_mapping = {s[2:]: s for s in list(self.valid_skills)}
        self.skill_data = get_data("skill")
        self.recipes = get_data("recipe")
        self.internal_name_mapping = {}
        for recipe in self.recipes:
            for internal_name in recipe["recipe_internals"]:
                skill_id = next(v for k, v in self.skill_names_id_mapping.items() if k in internal_name["id"])
                self.internal_name_mapping[internal_name["id"]] = (recipe["id"], skill_id)

    def return_knowns(self, data: dict[str, Any]):
        processed_data = {
            "items": self.get_items(data),
            "skills": self.get_skills(data),
            "recipes": self.get_recipes(data),
        }
        return processed_data

    def get_items(self, data: dict[str, Any]) -> list[ItemRef]:
        known_elements = data["CharacterCreationCommands"][0]["UniqueElementsManifested"]
        return [(ItemRef(id=ke)) for ke in known_elements if ke in self.valid_items]

    def get_skill_data(self, skill_id: str) -> Skill:
        assert skill_id in self.valid_skills
        skill = next(s for s in self.skill_data if s["id"] == skill_id)
        return Skill(**skill)

    def _get_skill(self, skill_datum: dict[str, Any]) -> KnownSkill:
        skill_payload = skill_datum["Payload"]
        skill_id = skill_payload["EntityId"]
        skill = self.get_skill_data(skill_id)

        known_skill = KnownSkill(id=skill_id, level=1)
        mutations = skill_payload["Mutations"]
        if "wisdom.committed" in mutations:
            not_wisdom = next(k.split("w.")[1].capitalize() for k, _ in mutations.items() if k.startswith("w."))
            wisdom = next(w for w in skill["wisdoms"] if w["id"] != not_wisdom)
            known_skill["committed_wisdom"] = wisdom
            evolvable_soul = next((k.split("a.")[1] for k, _ in mutations.items() if k.startswith("a.")), None)
            if evolvable_soul and evolvable_soul in self.valid_items:
                known_skill["evolvable_soul"] = ItemRef(id=evolvable_soul)
        if level_ups := mutations.get("skill", None):
            known_skill["level"] += level_ups
        return known_skill

    def get_skills(self, data: dict[str, Any]) -> list[KnownSkill]:
        root_data = data["RootPopulationCommand"]["Spheres"][20]
        assert root_data["GoverningSphereSpec"]["Id"] == "hand.skills"
        return [self._get_skill(skill_data) for skill_data in root_data["Tokens"]]

    def get_recipes(self, data: dict[str, Any]) -> list[KnownRecipe]:
        known_elements = data["CharacterCreationCommands"][0]["AmbittableRecipesUnlocked"]
        known_recipe_skills_mapping: dict[str, list[SkillRef]] = {}
        for element in known_elements:
            if element in self.internal_name_mapping:
                recipe_id, skill_id = self.internal_name_mapping[element]
                if recipe_id not in known_recipe_skills_mapping:
                    known_recipe_skills_mapping[recipe_id] = [SkillRef(id=skill_id)]
                else:
                    known_recipe_skills_mapping[recipe_id].append(SkillRef(id=skill_id))
        return [KnownRecipe(id=k, skills=v) for k, v in known_recipe_skills_mapping.items()]
