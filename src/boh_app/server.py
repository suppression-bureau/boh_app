from fastapi import FastAPI
from sqlalchemy import event
from sqlalchemy.orm import configure_mappers, mapper

from .data.load_data import load_all
from .database import Session, engine
from .models import Base, get_model_by_name
from .serializers import setup_schema

app = FastAPI()


def start_database():
    session = Session()
    event.listen(mapper, "after_configured", lambda: setup_schema(Base, session))
    Base.metadata.create_all(bind=engine)
    configure_mappers()
    load_all(session)
    return session


session = start_database()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/{table}")
async def get_all(table: str):
    model = get_model_by_name(table)
    with session.begin():
        data = session.query(model).all()
        resp = [model.__marshmallow__().dump(d) for d in data]
        return resp


@app.get("/{table}/{id}")
async def get_by_id(table: str, id: str | int):
    model = get_model_by_name(table)
    with session.begin():
        data = session.query(model).get(id)
        resp = model.__marshmallow__().dump(data)
        return resp


# app.mount("/graphql", GraphQL(build_schema(Base), context_value={"session": session}))
