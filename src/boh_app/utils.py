from collections.abc import Generator
from functools import cache
from pathlib import Path
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


@cache
def get_steam_data_dir() -> Path:
    from platformdirs import user_data_path

    return user_data_path("Steam")


@cache
def get_steam_config() -> dict[str, Any]:
    import vdf

    steam_data_dir = get_steam_data_dir()
    config_path = steam_data_dir / "config/config.vdf"
    config = vdf.loads(config_path.read_text())["InstallConfigStore"]

    return config["Software"]["Valve"]["Steam"]


def find_steam_lib_dirs() -> Generator[Path, None, None]:
    import vdf

    steam_data_dir = get_steam_data_dir()
    yield steam_data_dir

    steam_config = get_steam_config()
    if "BaseInstallFolder_1" in steam_config:
        yield (base_install_dir := Path(steam_config["BaseInstallFolder_1"]))
    else:
        base_install_dir = None

    lib_dirs_path = steam_data_dir / "steamapps/libraryfolders.vdf"
    lib_dirs = vdf.loads(lib_dirs_path.read_text())["libraryfolders"]
    for lib_dir_info in lib_dirs.values():
        lib_dir = Path(lib_dir_info["path"])
        if lib_dir not in (steam_data_dir, base_install_dir):
            yield lib_dir


def find_app_dirs(*, app_id: int, app_name: str) -> Generator[Path, None, None]:
    # get from config
    steam_config = get_steam_config()
    try:
        yield Path(steam_config["Apps"][str(app_id)]["installdir"])
    except KeyError:
        pass

    # get from steam install dirs
    for steam_dir in find_steam_lib_dirs():
        boh_dir = steam_dir / f"steamapps/common/{app_name}"
        if boh_dir.is_dir():
            yield boh_dir


def find_boh_dir() -> Path:
    for boh_dir in find_app_dirs(app_id=1028310, app_name="Book of Hours"):
        if (osx_dir := boh_dir / "OSX.app/Contents/Resources/Data").is_dir():
            return osx_dir
        if (linux_dir := boh_dir / "bh_Data").is_dir():
            return linux_dir
    raise RuntimeError("Failed to find Book of Hours")
