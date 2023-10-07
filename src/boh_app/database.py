import os

from platformdirs import user_cache_path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB_PATH = user_cache_path("boh_app") / "db.sqlite"
DEBUG = os.environ.get("DEBUG", "").lower() not in {"", "0", "false"}

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DB_PATH.unlink()
engine = create_engine(f"sqlite+pysqlite:///{DB_PATH}", echo=DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
