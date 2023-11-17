from typing import Any

from sqlalchemy_utils import ScalarListType


class TypedList(ScalarListType):
    coerce_func: type

    @property
    def python_type(self) -> Any:
        return list[self.coerce_func]
