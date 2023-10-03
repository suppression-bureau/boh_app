from ariadne.asgi import GraphQL
from fastapi import FastAPI
from graphql_sqlalchemy import build_schema
from sqlalchemy import event
from sqlalchemy.orm import mapper

from .data.load_data import load_all
from .database import Session, engine
from .models import Aspect, Base
from .serializers import setup_schema

app = FastAPI()


def start_database():
    session = Session()
    event.listen(mapper, "after_configured", setup_schema(Base, session))
    Base.metadata.create_all(bind=engine)
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
        resp = [Aspect.__marshmallow__().dump(d) for d in data]
        return resp


app.mount("/graphql", GraphQL(build_schema(Base), context_value={"session": session}))
