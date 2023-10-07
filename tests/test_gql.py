from collections.abc import Callable
from typing import Any, LiteralString

import pytest
from graphql import graphql_sync
from sqlalchemy.orm import Session

from boh_app.server import gql_schema


@pytest.fixture
def gql_query(db_session: Session) -> Callable[[LiteralString], dict[str, Any]]:
    def gql_query(src: LiteralString) -> dict[str, Any]:
        with db_session.begin():
            result = graphql_sync(gql_schema, src, context_value={"session": db_session})
        if result.errors:
            if len(result.errors) == 1:
                raise result.errors[0]
            else:
                raise ExceptionGroup("", result.errors)
        assert result.data is not None
        return result.data

    return gql_query


def test_qgl_serializer(gql_query):
    [assistant] = gql_query(
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
