import json
from pathlib import Path

from sqlalchemy.orm import Session

from ..database import Aspect
from ..database import Base
from ..database import Principle
from ..database import Wisdom

HERE = Path(__file__).parent


def get_data(name: str):
    with (HERE / f"{name}.json").open() as a:
        data = json.load(a)
        return data


def add_data(data: json, _class: Base, *, session: Session):
    with session.begin():
        for item_data in data:
            item = _class(**item_data)
            session.add(item)
        session.commit()


def load_all(session: Session):
    add_data(get_data("aspect"), Aspect, session=session)
    add_data(get_data("principle"), Principle, session=session)
    add_data(get_data("wisdom"), Wisdom, session=session)

