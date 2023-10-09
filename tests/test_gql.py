from collections.abc import Callable
from functools import partial
from typing import Any, LiteralString

import pytest
from sqlalchemy.orm import Session

from boh_app.utils import gql_query


@pytest.fixture
def query(db_session: Session) -> Callable[[LiteralString], dict[str, Any]]:
    return partial(gql_query, db_session=db_session)


def test_qgl_serializer(query):
    [assistant] = query(
        """query {
            assistant(
                where: { id: { _eq: "Coffinmaker" } }
            ) {
                id
                special_aspect {
                    id
                }
            }
        }""",
    )["assistant"]
    assert assistant == {
        "id": "Coffinmaker",
        "special_aspect": {"id": "wood"},
    }
