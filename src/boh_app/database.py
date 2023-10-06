import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DEBUG = os.environ.get("DEBUG", "").lower() not in {"", "0", "false"}
engine = create_engine("sqlite+pysqlite:///:memory:", echo=DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
