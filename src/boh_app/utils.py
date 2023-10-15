from typing import Any, LiteralString

from graphql import graphql_sync
from sqlalchemy.orm import Session

from .database import SessionLocal
from .graphql import gql_schema


def gql_query(src: LiteralString, *, db_session: Session | None = None) -> dict[str, Any]:
    if oneshot_session := (db_session is None):
        db_session = SessionLocal()
    with db_session.begin():
        result = graphql_sync(gql_schema, src, context_value={"session": db_session})
    if oneshot_session:
        db_session.close()

    if result.errors:
        if len(result.errors) == 1:
            raise result.errors[0]
        else:
            raise ExceptionGroup("", result.errors)
    assert result.data is not None
    return result.data
