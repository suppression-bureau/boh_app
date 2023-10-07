from collections.abc import Generator

import pytest
from sqlalchemy.orm import Session

from boh_app.server import get_sess


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    yield from get_sess()
