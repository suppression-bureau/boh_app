import json
import warnings
from pathlib import Path
from typing import Any

from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import Session

from ..models import Base, get_tablename_model_mapping
from ..settings import CACHE_DIR

HERE = Path(__file__).parent


def get_data(path: Path):
    with path.open() as a:
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
    from .generate_items import gen_items_json

    gen_items_json()

    data_file_paths = {f.stem: f for f in HERE.glob("*.json")}
    cached_file_paths = {f.stem: f for f in CACHE_DIR.glob("*.json")}
    data_file_paths = {**data_file_paths, **cached_file_paths}
    sorted_table_names = [t.fullname for t in Base.metadata.sorted_tables]
    tablename2model = get_tablename_model_mapping()
    for name in sorted_table_names:
        if name in data_file_paths:
            path = data_file_paths[name]
            add_data(get_data(path), tablename2model[name], session=session)
