import json
from pathlib import Path

from ..database import Session
from ..models import Base, get_model_by_name

HERE = Path(__file__).parent


def get_data(name: str):
    with (HERE / f"{name}.json").open() as a:
        data = json.load(a)
        return data


def add_data(data: json, _class: Base, *, session: Session):
    serializer = _class.__marshmallow__(many=True)
    with session.begin():
        items = serializer.load(data, session=session)
        for item in items:
            session.add(item)
        session.commit()


def load_all(session: Session):
    names = ["aspect", "principle", "wisdom"]
    for name in names:
        add_data(get_data(name), get_model_by_name(name), session=session)
