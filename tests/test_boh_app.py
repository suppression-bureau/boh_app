from fastapi.testclient import TestClient

from boh_app import models
from boh_app.server import app

client = TestClient(app)


def test_rest_serializer():
    result = client.get("assistant")
    assert result.status_code == 200
    assistants = {a["id"]: a for a in result.json()}
    asp_names = {asp["id"] for asp in assistants["Consulting Engineer"]["accepted_aspects"]}
    assert asp_names == {*models.Assistant.base_aspects, "fuel"}
