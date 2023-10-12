from boh_app import models
from boh_app.data.load_data import get_data


def test_post_no_fk(client):
    fake_data = {"id": "test_value"}
    result = client.post("aspect", json=fake_data)

    model_serializer = models.Aspect.__marshmallow__(transient=True)
    fake_model_instance = model_serializer.load(fake_data)
    assert result.status_code == 201
    assert result.json() == model_serializer.dump(fake_model_instance)


def test_put(client):
    skill_data = get_data("skill")
    og_skill_data = skill_data[0]
    new_data = {"wisdom_1": {"id": "test_value"}}
    updated_data = {**og_skill_data, **new_data}
    assert og_skill_data != updated_data

    result = client.put(f"/skill/{og_skill_data['id']}", json=updated_data)
    assert result.status_code == 200

    # need to load the data through the serializer to get hybrid properties
    # transient=True indicates we are Not touching the Database
    model_serializer = models.Skill.__marshmallow__(transient=True)
    full_updated_data = model_serializer.load(updated_data)
    assert result.json() == model_serializer.dump(full_updated_data)
