import json
import warnings
from pathlib import Path
from typing import Any

from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import Session

from ..models import Base, get_model_by_tablename

HERE = Path(__file__).parent


def get_data(name: str):
    with (HERE / f"{name}.json").open() as a:
        data = json.load(a)
        return data


def add_data(data: Any, _class: type[Base], *, session: Session):
    # set transient=True to avoid warning when trying to get instance with id=None
    # i.e. with priniciple_count when UQ exists
    serializer = _class.__marshmallow__(many=True, transient=False)
    with session.begin():
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=SAWarning)
            items = serializer.load(data, session=session)
        for item in items:
            session.add(item)
        session.commit()


def load_all(session: Session) -> None:
    data_file_names = [f.stem for f in HERE.glob("*.json")]
    sorted_table_names = [t.fullname for t in Base.metadata.sorted_tables]
    for name in sorted_table_names:
        if name in data_file_names:
            add_data(get_data(name), get_model_by_tablename(name), session=session)
