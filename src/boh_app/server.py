from ariadne.asgi import GraphQL
from fastapi import Depends, FastAPI
from graphql_sqlalchemy import build_schema
from sqlalchemy.orm import Session, configure_mappers

from .data.load_data import load_all
from .database import SessionLocal, engine
from .models import Base, get_model_by_name
from .serializers import setup_schema


def init_db():
    Base.metadata.create_all(bind=engine)
    configure_mappers()

    session = SessionLocal()
    setup_schema(Base, session)  # depends on mappers being configured
    load_all(session)  # depends on schema being setup
    session.close()


def get_sess():
    session = SessionLocal()
    try:
        yield session
    except Exception:
        session.close()


init_db()

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/{table}")
def get_all(table: str, session: Session = Depends(get_sess)):
    model = get_model_by_name(table)
    serializer = model.__marshmallow__(many=True)
    with session.begin():
        data = session.query(model).all()
        resp = serializer.dump(data)
        return resp


@app.get("/{table}/{id}")
def get_by_id(table: str, id: str | int, session: Session = Depends(get_sess)):
    model = get_model_by_name(table)
    with session.begin():
        data = session.query(model).get(id)
        resp = model.__marshmallow__().dump(data)
        return resp


app.mount("/graphql", GraphQL(build_schema(Base)))  # , context_value={"session": session}))
