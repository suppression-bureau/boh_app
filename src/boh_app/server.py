from enum import EnumType

from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler
from fastapi import Depends, FastAPI, Request
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from graphql_sqlalchemy import build_schema
from sqlalchemy.orm import Session

from .database import SessionLocal, get_sess, init_db
from .models import Base, get_model_by_name

ValidTables: EnumType = init_db()

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
def get_all(table: ValidTables, session: Session = Depends(get_sess)):
    model = get_model_by_name(ValidTables[table].name)
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
