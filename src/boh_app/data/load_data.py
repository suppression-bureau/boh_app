import json
import warnings
from pathlib import Path
from typing import Any

from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import Session

from ..models import Base, get_model_by_name

HERE = Path(__file__).parent


def get_data(name: str):
    with (HERE / f"{name}.json").open() as a:
        data = json.load(a)
        return data


def add_data(data: Any, _class: type[Base], *, session: Session):
    # set transient=True to avoid warning when trying to get instance with id=None
    # i.e. with priniciple_count
    serializer = _class.__marshmallow__(many=True, transient=False)
    with session.begin():
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=SAWarning)
            items = serializer.load(data, session=session)
        for item in items:
            session.add(item)
        session.commit()


def load_all(session: Session) -> None:
    # TODO: make glob
    names = ["aspect", "principle", "wisdom", "assistant", "skill"]
    for name in names:
        add_data(get_data(name), get_model_by_name(name), session=session)
