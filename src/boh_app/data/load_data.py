import json
import warnings
from pathlib import Path
from typing import Any, get_args

from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import Session

from boh_app.data.types import PrincipleID

from ..models import Base, Principle, get_tablename_model_mapping
from ..settings import CACHE_DIR

HERE = Path(__file__).parent


def get_data(name: str = "", *, path: Path | None = None) -> list[dict[str, Any]]:
    assert not (name and path), "Cannot specify both name and path"
    if name and not path:
        path = HERE / f"{name}.json"
    assert path, "Either name or path must be provided"
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
    data_file_paths = find_files()
    tablename2model = get_tablename_model_mapping()
    add_data([{"id": p} for p in get_args(PrincipleID)], Principle, session=session)
    for name in [t.fullname for t in Base.metadata.sorted_tables]:
        if name in data_file_paths:
            path = data_file_paths[name]
            add_data(get_data(path=path), tablename2model[name], session=session)
