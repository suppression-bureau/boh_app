from typing import Any

import pytest
from fastapi.testclient import TestClient

from boh_app import models
from boh_app.data.load_data import get_data


def get_loaded_data(data: dict[str, Any], model: type[models.Base]) -> dict[str, Any]:
    # data must be loaded through marshmallow serializer to get hybrid properties
    # transient=True indicates we are Not touching the Database
    model_sqla: type[models.Base] = model.__marshmallow__(transient=True, many=False).load(data)
    model_python = model.__pydantic__.model_validate(model_sqla, from_attributes=True)
    return model.__pydantic__.model_dump(model_python, mode="json")


def test_post_no_fk(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.post("aspect", json=fake_data)
    assert result.status_code == 201, result.json()
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_post_w_generated_id(client: TestClient):
    fake_data = {"principle": {"id": "edge"}, "count": 1}
    result = client.post("principle_count", json=fake_data)
    assert result.status_code == 201, result.json()
    data = result.json()

    # id is db-generated, cannot be "validated"
    data.pop("id")
    expected_data = get_loaded_data({**fake_data, "id": -1}, models.PrincipleCount)
    expected_data.pop("id")
    assert data == expected_data


def test_put_new_entry(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.put(f"aspect/{fake_data['id']}", json=fake_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_put_replace_fk(client: TestClient):
    skill_data = get_data("skill")
    og_skill_data = skill_data[0]
    new_data = {"wisdom_1": {"id": "test_value"}}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.put(f"/skill/{og_skill_data['id']}", json=updated_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Skill)


@pytest.mark.skip(reason="fails due to response data validation, no simple enough model")
def test_patch_field(client: TestClient):
    assistant_data = get_data("assistant")
    og_assistant_data = assistant_data[0]

    fake_data = {"season": "autumn"}
    updated_data = {**og_assistant_data, **fake_data}
    result = client.patch(f"assistant/{og_assistant_data['id']}", json=fake_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Assistant)
    # doesn't work because of `accepted_aspects` and `base_principlees`


def test_patch_fk(client: TestClient):
    skill_data = get_data("skill")
    og_skill_data = skill_data[0]
    new_data = {"wisdom_1": {"id": "test_value"}}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.patch(f"/skill/{og_skill_data['id']}", json=new_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Skill)
