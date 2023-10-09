from enum import StrEnum

from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler
from fastapi import Depends, FastAPI, Request
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from graphql_sqlalchemy import build_schema
from sqlalchemy.orm import Session, configure_mappers

from .data.load_data import load_all
from .database import SessionLocal, engine
from .models import Base, get_model_by_name
from .serializers import setup_schema

Tables = None


def init_db():
    global Tables
    Base.metadata.create_all(bind=engine)
    configure_mappers()

    session = SessionLocal()
    setup_schema(Base, session)  # depends on mappers being configured
    load_all(session)  # depends on schema being setup
    session.close()
    tables = [k.lower() for k in Base.registry._class_registry.keys() if not k.startswith("_")]
    Tables = StrEnum("Tables", tables)


def get_sess():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


init_db()

app = FastAPI()

cors = Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.user_middleware.insert(0, cors)

gql_schema = build_schema(Base)

graphql_app = GraphQL(
    gql_schema,
    context_value={"session": SessionLocal()},
    websocket_handler=GraphQLTransportWSHandler(),
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


# See: https://ariadnegraphql.org/docs/fastapi-integration#graphql-routes
@app.get("/graphql")
@app.options("/graphql")
async def handle_graphql_explorer(request: Request):
    return await graphql_app.handle_request(request)


@app.post("/graphql")
async def handle_graphql_query(request: Request, db=Depends(get_sess)):
    request.scope["db"] = db
    return await graphql_app.handle_request(request)


@app.get("/{table}")
def get_all(table: Tables, session: Session = Depends(get_sess)):
    model = get_model_by_name(Tables[table].name)
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
