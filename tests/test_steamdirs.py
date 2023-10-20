from pathlib import Path

import pytest


def test_find_steam_dirs(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from boh_app import utils

    data_dir = tmp_path / "data-steam"
    conf_path = data_dir / "config/config.vdf"
    lib_dir_path = data_dir / "steamapps/libraryfolders.vdf"
    base_inst = tmp_path / "base-steam"
    other_lib = tmp_path / "lib1"

    monkeypatch.setattr(utils, "get_steam_data_dir", lambda: data_dir)
    conf_path.parent.mkdir(parents=True)
    conf_path.write_text(
        f"""
        "InstallConfigStore"
        {{
            "Software"
            {{
                "Valve"
                {{
                    "Steam"
                    {{
                        "BaseInstallFolder_1"  "{base_inst}"
                    }}
                }}
            }}
        }}
        """
    )
    lib_dir_path.parent.mkdir(parents=True)
    lib_dir_path.write_text(
        f"""
        libraryfolders
        {{
            "0"
            {{
                "path"  "{other_lib}"
            }}
        }}
        """
    )

    for path in [data_dir, base_inst, other_lib]:
        (path / "steamapps/common/Book of Hours").mkdir(parents=True)

    expected = [(path / "steamapps/common/Book of Hours") for path in [data_dir, base_inst, other_lib]]

    assert list(utils.find_app_dirs()) == expected
