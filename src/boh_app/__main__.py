import warnings
from pathlib import Path
from typing import Annotated, LiteralString, Optional, cast

import typer
from graphql import IntrospectionQuery, build_client_schema, get_introspection_query, print_schema

from .database import DB_PATH
from .utils import gql_query

app = typer.Typer()


@app.command()
def schema(
    out_path: Annotated[Optional[Path], typer.Argument()] = None,
    watch: Annotated[bool, typer.Option("-w", "--watch", help="Watch for changes")] = False,
) -> None:
    """Serialize generated schema to GraphQL schema language."""
    query = cast(LiteralString, get_introspection_query(descriptions=True))
    data = cast(IntrospectionQuery, gql_query(query))
    client_schema = build_client_schema(data)
    schema_src = print_schema(client_schema)
    if watch:
        warnings.warn("TODO", stacklevel=1)
    if out_path is None:
        print(schema_src)
    else:
        out_path.write_text(schema_src)


@app.command()
def empty_db() -> None:
    """Delete automatically generated database."""
    if DB_PATH.is_file():
        DB_PATH.unlink()


if __name__ == "__main__":
    app()
