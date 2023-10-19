from typing import Any

import rich.traceback
from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler
from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import SessionLocal, get_sess, init_db
from .graphql import gql_schema
from .models import Base

table_name2model = init_db()

rich.traceback.install()

app = FastAPI()

cors = Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.user_middleware.insert(0, cors)

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
        response_model=list[model.__pydantic__],
        summary=f"Get all {table_name}s",
    )
    def _get_all(session: Session = Depends(get_sess)):
        with session.begin():
            data = session.query(model).all()
            return [model.__pydantic__.model_validate(d) for d in data]

    @app.get(
        f"/{table_name}/{{id}}",
        response_model=model.__pydantic__,
        summary=f"Get a {table_name} by ID",
    )
    def _get_by_id(id: str | int, session: Session = Depends(get_sess)):
        with session.begin():
            data = session.get(model, id)
            if data is None:
                return None  # TODO: 404
            return model.__pydantic__.model_validate(data)

    @app.post(
        f"/{table_name}",
        response_model=model.__pydantic__,
        summary=f"Create a {table_name}",
        status_code=status.HTTP_201_CREATED,
    )
    def _create(
        data: model.__pydantic_put__,
        session: Session = Depends(get_sess),
    ):
        with session.begin():
            serializer = model.__marshmallow__(session=session)
            item: Base = serializer.load(data.model_dump())
            session.add(item)
            session.flush()
            resp = model.__pydantic__.model_validate(item)
            session.commit()
        return resp

    @app.put(
        f"/{table_name}/{{id}}",
        response_model=model.__pydantic__,
        summary=f"Add or Update a {table_name}",
    )
    def _put(
        id: str | int,
        data: model.__pydantic_put__,  # NB: cannot use PUT for `IdMixin`-derived models
        session: Session = Depends(get_sess),
    ):
        with session.begin():
            assert id == data.id, data.model_dump()
            # https://docs.sqlalchemy.org/en/20/orm/contextual.html#sqlalchemy.orm.scoped_session.get
            if item := session.get(model, id):
                # marshmallow loads nested items as model objects, which can be set on model
                serializer = model.__marshmallow__(session=session)
                m_item: Base = serializer.load(data.model_dump())
                for field in data.model_fields_set:
                    setattr(item, field, getattr(m_item, field))
            else:
                item = model(**data.model_dump())
            session.add(item)
            session.flush()
            resp = model.__pydantic__.model_validate(item)
            session.commit()
        return resp

    @app.patch(
        f"/{table_name}/{{id}}",
        response_model=model.__pydantic__,
        summary=f"Update a {table_name}",
    )
    def _patch(
        id: str | int,
        data: dict[str, Any],
        session: Session = Depends(get_sess),
    ):
        pass


for table_name, model in table_name2model.items():
    register_model(table_name, model)
