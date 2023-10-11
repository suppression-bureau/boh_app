import os

from platformdirs import user_cache_path
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers, sessionmaker

from .data.load_data import load_all
from .models import Base, get_tablename_model_mapping
from .serializers import setup_schema

DB_PATH = user_cache_path("boh_app") / "db.sqlite"
DEBUG = os.environ.get("DEBUG", "").lower() not in {"", "0", "false"}

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
if DB_PATH.is_file():
    DB_PATH.unlink()

engine = create_engine(f"sqlite+pysqlite:///{DB_PATH}", echo=DEBUG)

SessionLocal: sessionmaker[Session] = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> dict[str, type[Base]]:
    Base.metadata.create_all(bind=engine)
    configure_mappers()

    session = SessionLocal()
    setup_schema(Base, session=session)  # depends on mappers being configured
    load_all(session)  # depends on schema being setup
    session.close()

    return get_tablename_model_mapping()


def get_sess():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
