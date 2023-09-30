from ariadne.asgi import GraphQL
from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker
from graphql_sqlalchemy import build_schema

from .data.load_data import load_all
from .database import Aspect
from .database import Base
from .database import engine

app = FastAPI()


def start_database():
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    load_all(session)
    return session


session = start_database()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/aspect")
async def get_all_aspect():
    with session.begin():
        data = session.query(Aspect).all()
        return data


app.mount("/graphql", GraphQL(build_schema(Base), context_value=dict(session=session)))
