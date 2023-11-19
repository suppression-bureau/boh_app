from typing import Any

import pytest
from fastapi.testclient import TestClient

from boh_app import models


def get_loaded_data(data: dict[str, Any], model: type[models.Base]) -> dict[str, Any]:
    # data must be loaded through marshmallow serializer to get hybrid properties
    # transient=True indicates we are Not touching the Database
    model_sqla: type[models.Base] = model.__marshmallow__(transient=True, many=False).load(data)
    model_python = model.__pydantic__.model_validate(model_sqla, from_attributes=True)
    return model_python.model_dump(mode="json")


@pytest.fixture
def skill_test_data(client: TestClient) -> dict[str, Any]:
    data = {
        "id": "Anbary & Lapidary",
        "name": "Anbary & Lapidary",
        "primary_principle": "sky",
        "secondary_principle": "forge",
        "wisdoms": [{"id": "Horomachistry"}, {"id": "Ithastry"}],
        "level": 3,
        "committed": True,
    }
    result = client.post("skill", json=data)
    assert result.status_code == 201
    return data


def test_get_by_id_404(client: TestClient):
    result = client.get("aspect/dne")
    assert result.status_code == 404
    assert result.json() == {"detail": "No aspect with ID dne"}


def test_post_no_fk(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.post("aspect", json=fake_data)
    assert result.status_code == 201, result.json()
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_post_w_generated_id(client: TestClient):
    fake_data = {"principle": "edge", "count": 1}
    result = client.post("principle_count", json=fake_data)
    assert result.status_code == 201, result.json()
    data = result.json()

    # id is db-generated, cannot be "validated"
    data.pop("id")
    expected_data = get_loaded_data({**fake_data, "id": -1}, models.PrincipleCount)
    expected_data.pop("id")
    assert data == expected_data


def test_put_id_mismatch(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.put("aspect/dne", json=fake_data)
    assert result.status_code == 400
    assert result.json() == {"detail": "routing ID dne does not match ID in data test_value"}


def test_put_new_entry(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.put(f"aspect/{fake_data['id']}", json=fake_data)
    assert result.status_code == 201, result.json()
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_put_replace_fk(client: TestClient, skill_test_data: dict[str, Any]):
    og_skill_data = skill_test_data
    new_data = {"primary_principle": "grail"}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.put(f"/skill/{og_skill_data['id']}", json=updated_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Skill)


def test_patch_404(client: TestClient):
    fake_data = {"id": "test_value"}
    result = client.patch(f"aspect/{fake_data['id']}", json=fake_data)
    assert result.status_code == 404
    assert result.json() == {"detail": "No aspect with ID test_value"}


@pytest.mark.xfail(reason="Never actually worked, as serializers req most fields, except when they have db defaults")
def test_patch_field(client: TestClient, skill_test_data: dict[str, Any]):
    og_skill_data = skill_test_data

    fake_data = {"level": 9}
    updated_data = {**og_skill_data, **fake_data}
    result = client.patch(f"skill/{og_skill_data['id']}", json=fake_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Skill)


@pytest.mark.xfail(reason="Never actually worked, as serializers req most fields, except when they have db defaults")
def test_patch_fk(client: TestClient, skill_test_data: dict[str, Any]):
    og_skill_data = skill_test_data
    new_data = {"primary_principle": "edge"}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.patch(f"/skill/{og_skill_data['id']}", json=new_data)
    assert result.status_code == 200, result.json()
    assert result.json() == get_loaded_data(updated_data, models.Skill)
