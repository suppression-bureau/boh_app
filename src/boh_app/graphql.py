from graphql_sqlalchemy import build_schema

from .models import Base

gql_schema = build_schema(Base)
