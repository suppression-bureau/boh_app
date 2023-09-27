from fastapi import FastAPI
from sqlalchemy.orm import Session

from database import engine, Base, Aspect
from data.load_data import load_all


app = FastAPI()

def start_database():
    Base.metadata.create_all(bind=engine)
    load_all()

start_database()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/aspect")
async def get_all_aspect():
    with Session(engine) as session:
        data = session.query(Aspect).all()
        return data