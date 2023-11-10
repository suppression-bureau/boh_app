import json
import logging
import warnings
from pathlib import Path
from typing import Any, get_args

from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import Session

from boh_app.data.types import PrincipleID

from ..models import Base, get_tablename_model_mapping
from ..settings import CACHE_DIR

HERE = Path(__file__).parent
SPECIAL = {"principle"}
"""Data not loaded from JSON"""


def get_data(name: str) -> list[dict[str, Any]]:
    if name == "principle":
        return [{"id": p} for p in get_args(PrincipleID)]
    data_file_paths = find_files()
    path = data_file_paths[name]
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


def find_files():
    here_file_paths = {f.stem: f for f in HERE.glob("*.json")}
    cached_file_paths = {f.stem: f for f in CACHE_DIR.glob("*.json")}
    return {**here_file_paths, **cached_file_paths}


def load_all(session: Session) -> None:
    """Load sorted data into database."""
    data_sources = find_files() | dict.fromkeys(SPECIAL)
    tablename2model = get_tablename_model_mapping()
    # add recipe dependency on skill to ensure skill sorted before recipe
    Base.metadata.tables["recipe"].add_is_dependent_on(Base.metadata.tables["skill"])
    for name in [t.fullname for t in Base.metadata.sorted_tables]:
        if name in data_sources:
            logging.info(f"Loading {name} data from {data_sources[name] or 'special source'}")
            add_data(get_data(name), tablename2model[name], session=session)
