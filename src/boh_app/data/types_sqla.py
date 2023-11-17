from sqlalchemy_utils import ScalarListType


class TypedList(ScalarListType):
    coerce_func: type

    @property
    def python_type(self) -> type:
        return list
