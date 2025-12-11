from sqlmodel import SQLModel, create_engine
from sqlmodel import Session
import os

# SQLite DB in project folder
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./be_app.db")

engine = create_engine(DATABASE_URL, echo=False, connect_args={
                       "check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
