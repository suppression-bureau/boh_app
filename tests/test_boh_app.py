from typing import Any

from fastapi.testclient import TestClient

from boh_app import models
from boh_app.data.load_data import get_data


def get_loaded_data(data: dict[str, Any], model: type[models.Base]) -> dict[str, Any]:
    # data must be loaded through the serializer to get hybrid properties
    model_data = model.__pydantic__.model_validate(data)
    return model.__pydantic__.model_dump(model_data)


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
    expected_data = {**updated_data, "wisdoms": [{"id": "test_value"}, skill_data[0]["wisdom_2"]]}
    assert result.json() == get_loaded_data(expected_data, models.Skill)
