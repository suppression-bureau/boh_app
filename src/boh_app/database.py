from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)

Session = sessionmaker(bind=engine)
session = scoped_session(Session)
