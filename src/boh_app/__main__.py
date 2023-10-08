import sys
from pathlib import Path
from typing import LiteralString, cast

from graphql import IntrospectionQuery, build_client_schema, get_introspection_query, print_schema

from .utils import gql_query


def main(args: list[str] | None = None) -> None:
    if args is None:
        args = sys.argv[1:]
    out_path = Path(args[0])

    query = cast(LiteralString, get_introspection_query(descriptions=True))
    data = cast(IntrospectionQuery, gql_query(query))
    client_schema = build_client_schema(data)
    with out_path.open("w") as f:
        f.write(print_schema(client_schema))


if __name__ == "__main__":
    main()
