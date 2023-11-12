from pathlib import Path
from typing import Any

from .types import Principle, Skill, Wisdom
from .utils import SteamFiles, get_steam_data, get_valid_refs, write_gen_file

HERE = Path(__file__).parent


def gen_skills_json():
    data = get_steam_data(SteamFiles.SKILL)
    handler = SkillHandler()
    model_data = [handler.mk_model_data(d) for d in data]

    write_gen_file("skill", model_data)


class SkillHandler:
    def __init__(self):
        self.principles = get_valid_refs("principle")
        self.wisdoms = get_valid_refs("wisdom")

    def mk_model_data(self, skill: dict[str, Any]) -> Skill:
        wisdoms, primary_principle, secondary_principle = [], None, None
        for key, value in skill["aspects"].items():
            if key in self.principles:
                if value == 1:
                    secondary_principle = Principle(id=key)
                elif value == 2:
                    primary_principle = Principle(id=key)
            if key.startswith("w."):
                wisdom = key.split("w.")[1].capitalize()
                assert wisdom in self.wisdoms
                wisdoms.append(Wisdom(id=wisdom))
        assert primary_principle, f"Could not find primary principle for {skill['Label']}"
        assert secondary_principle, f"Could not find secondary principle for {skill['Label']}"
        return Skill(
            id=skill["ID"],
            name=skill["Label"],
            primary_principle=primary_principle,
            secondary_principle=secondary_principle,
            wisdoms=wisdoms,
        )
