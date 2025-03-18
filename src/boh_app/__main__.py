import logging
import sys
from asyncio.subprocess import create_subprocess_exec
from functools import wraps
from pathlib import Path
from typing import Annotated, LiteralString, Optional, cast

import anyio
import typer
from graphql import IntrospectionQuery, build_client_schema, get_introspection_query, print_schema
from rich.logging import RichHandler

from .settings import CACHE_DIR

HERE = Path(__file__).parent

app = typer.Typer(no_args_is_help=True)


def run_async(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        async def coro_wrapper():
            return await func(*args, **kwargs)

        return anyio.run(coro_wrapper)

    return wrapper


@app.command()
def api(
    *,
    reload: Annotated[bool, typer.Option(envvar="DEBUG")] = False,
) -> None:
    """Start the API server."""
    import uvicorn

    uvicorn.run(
        "boh_app.server:app",
        host="127.0.0.1",
        port=8000,
        reload=reload,
        use_colors=True,
    )


@app.command()
@run_async
async def schema(
    out_path: Annotated[Optional[Path], typer.Argument()] = None,
    watch: Annotated[bool, typer.Option("-w", "--watch", help="Watch for changes")] = False,
) -> None:
    """Serialize generated schema to GraphQL schema language."""
    from watchfiles import awatch

    from .utils import gql_query

    query = cast("LiteralString", get_introspection_query(descriptions=True))
    data = cast("IntrospectionQuery", gql_query(query))
    client_schema = build_client_schema(data)
    schema_src = print_schema(client_schema)

    # print the schema once
    if out_path is None:
        print(schema_src)
    else:
        out_path.write_text(schema_src)
    if not watch:
        return

    # watch for changes, rerun CLI with updated schema
    args = ["-m", "boh_app", "schema"]
    if out_path is not None:
        args.append(str(out_path))
    async for _change in awatch(HERE):
        if out_path is not None:
            typer.echo(f"Regenerating {out_path}")
        await create_subprocess_exec(sys.executable, *args)


@app.command()
def empty_db() -> None:
    """Delete automatically generated database."""
    from .database import DB_PATH

    if DB_PATH.is_file():
        DB_PATH.unlink()


@app.command()
def gen_items() -> None:
    """Generate `item.json`. NB: Overwrites existing file and
    is not run by default during `boh_app.data.load_data.load_all`."""
    from .data.generate_items import gen_items_json

    gen_items_json()


@app.command()
def gen_workstations() -> None:
    """Generate `workstation.json` and `workstation_slot.json`.
    NB: Overwrites existing files and is not run by default
    during `boh_app.data.load_data.load_all`."""
    from .data.generate_workstations import gen_workstation_json

    gen_workstation_json()


@app.command()
def gen_skills() -> None:
    """Generate `skill.json`. NB: Overwrites existing file and
    is not run by default during `boh_app.data.load_data.load_all`."""
    from .data.generate_skills import gen_skills_json

    gen_skills_json()


@app.command()
def gen_recipes() -> None:
    """Generate `recipe.json`. NB: Overwrites existing file and
    is not run by default during `boh_app.data.load_data.load_all`."""
    from .data.generate_recipes import gen_recipes_json

    gen_recipes_json()


@app.command()
def gen_all() -> None:
    """Generate all data. NB: Overwrites existing files and
    is not run by default during `boh_app.data.load_data.load_all`."""
    from .data.generate_items import gen_items_json
    from .data.generate_recipes import gen_recipes_json
    from .data.generate_skills import gen_skills_json
    from .data.generate_workstations import gen_workstation_json

    gen_items_json()
    gen_skills_json()
    gen_workstation_json()
    gen_recipes_json()


@app.command()
def reset() -> None:
    """Delete *all* files in CACHE_DIR, including database file, and run `gen-all`."""
    for path in CACHE_DIR.glob("*"):
        logging.info(f"Deleting file at: {path}")
        path.unlink()
    gen_all()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, handlers=[RichHandler()])
    app()
