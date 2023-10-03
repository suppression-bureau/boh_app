import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

DEBUG = os.environ.get("DEBUG", "").lower() not in {"", "0", "false"}
engine = create_engine("sqlite+pysqlite:///:memory:", echo=DEBUG)

Session = sessionmaker(bind=engine)
session = scoped_session(Session)
