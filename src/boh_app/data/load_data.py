import json
from database import engine, Base, Aspect, Principle, Wisdom
from sqlalchemy.orm import Session
            
def get_data(name: str):
    with open(f'data/{name}.json') as a:
        data = json.load(a)
        return data

def add_data(data: json, _class: Base):
    for item_data in data:
        with Session(engine) as session:
            item = _class(**item_data)
            session.add(item)
            session.commit()

def load_all():
    add_data(get_data("aspect"), Aspect)
    add_data(get_data("principle"), Principle)
    add_data(get_data("wisdom"), Wisdom)

