from collections.abc import Sequence
from typing import Any, TypeVar

from sqlalchemy import JSON, Dialect, TypeDecorator
from sqlalchemy.types import TypeEngine

T = TypeVar("T")


class JsonArray(TypeDecorator[Sequence[T]]):
    impl = JSON
    cache_ok = True

    item_type: TypeEngine[T]
    nullable: bool

    def __init__(self, item_type: TypeEngine[T] | type[TypeEngine[T]], *, nullable: bool = False) -> None:
        super().__init__(none_as_null=True)
        self.item_type = item_type() if isinstance(item_type, type) else item_type
        self.nullable = nullable

    def process_bind_param(self, value: Sequence[T] | None, dialect: Dialect) -> Sequence[T] | None:
        if value is None:
            return None if self.nullable else []
        if not isinstance(value, Sequence):
            raise TypeError(f"value must be a sequence, not a {type(value)}")
        processor = self.item_type.bind_processor(dialect)
        assert processor
        return [processor(item) for item in value]

    def process_result_value(self, value: Any | None, dialect: Dialect) -> list[T] | None:
        if value is None:
            return None if self.nullable else []
        if not isinstance(value, list):
            raise TypeError(f"value must be a list, not a {type(value)}")
        # TODO: processor = self.item_type.result_processor(dialect, ???)
        return value

    @property
    def python_type(self) -> type[list[T]]:
        return list
