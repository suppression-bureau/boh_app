from typing import Any

from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler
from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from graphql_sqlalchemy import build_schema
from sqlalchemy.orm import Session

from .database import SessionLocal, get_sess, init_db
from .models import Base

table_name2model = init_db()

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


def register_model(table_name: str, model: type[Base]):
    @app.get(
        f"/{table_name}",
        # response_model=list[model.__pydantic__],  # pydantic not set up for relationships or FKs
        summary=f"Get all {table_name}s",
    )
    def _get_all(session: Session = Depends(get_sess)):
        serializer = model.__marshmallow__(many=True, session=session)
        with session.begin():
            data = session.query(model).all()
            resp = serializer.dump(data)
            return resp

    @app.get(
        f"/{table_name}/{{id}}",
        # response_model=model.__pydantic__,  # pydantic not set up for relationships or FKs
        summary=f"Get a {table_name} by ID",
    )
    def _get_by_id(id: str | int, session: Session = Depends(get_sess)):
        with session.begin():
            data = session.get(model, id)
            resp = model.__marshmallow__(session=session).dump(data)
            return resp

    @app.post(
        f"/{table_name}",
        # response_model=model.__pydantic__,  # pydantic not set up for relationships or FKs
        summary=f"Create a {table_name}",
        status_code=status.HTTP_201_CREATED,
    )
    def _create(
        data: dict[str, Any],
        # data: model.__pydantic__,
        session: Session = Depends(get_sess),
    ):
        with session.begin():
            serializer = model.__marshmallow__(session=session)
            item: Base = serializer.load(data)
            session.add(item)
            resp = model.__marshmallow__().dump(item)
            session.commit()
        return resp

    @app.put(
        f"/{table_name}/{{id}}",
        # response_model=model.__pydantic__,  # pydantic not set up for relationships or FKs
        summary=f"Add or Update a {table_name}",
    )
    def _put(
        id: str | int,
        # data: model.__pydantic__,
        data: dict[str, Any],
        session: Session = Depends(get_sess),
    ):
        with session.begin():
            # https://docs.sqlalchemy.org/en/20/orm/contextual.html#sqlalchemy.orm.scoped_session.get
            serializer = model.__marshmallow__(session=session)
            item: Base = serializer.load(data)
            session.add(item)
            resp = serializer.dump(item)
            session.commit()
        return resp


for table_name, model in table_name2model.items():
    register_model(table_name, model)
