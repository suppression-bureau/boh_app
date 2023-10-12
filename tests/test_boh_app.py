from typing import Any

from boh_app import models
from boh_app.data.load_data import get_data


def get_loaded_data(data: dict[str, Any], model: type[models.Base]) -> dict[str, Any]:
    # data must be loaded through the serializer to get hybrid properties
    # transient=True indicates we are Not touching the Database
    serializer = model.__marshmallow__(transient=True, many=False)
    model_data = serializer.load(data)
    return serializer.dump(model_data)


def test_post_no_fk(client):
    fake_data = {"id": "test_value"}
    result = client.post("aspect", json=fake_data)
    assert result.status_code == 201
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_put_new_entry(client):
    fake_data = {"id": "test_value"}
    result = client.put(f"aspect/{fake_data['id']}", json=fake_data)
    assert result.status_code == 200
    assert result.json() == get_loaded_data(fake_data, models.Aspect)


def test_put_replace_fk(client):
    skill_data = get_data("skill")
    og_skill_data = skill_data[0]
    new_data = {"wisdom_1": {"id": "test_value"}}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.put(f"/skill/{og_skill_data['id']}", json=updated_data)
    assert result.status_code == 200
    assert result.json() == get_loaded_data(updated_data, models.Skill)
