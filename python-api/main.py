from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Athlete(BaseModel):
    id: Optional[str]
    name: str
    sport: str
    bio: Optional[str] = None

DB = {
    "1": {"id":"1","name":"Ravi","sport":"Kabaddi","bio":"Quick & agile"},
    "2": {"id":"2","name":"Virat","sport":"Cricket","bio":"Consistent batter"}
}

@app.get("/")
def root():
    return {"msg":"FastAPI running"}

@app.get("/athlete/{id}", response_model=Athlete)
def get_athlete(id: str):
    if id not in DB:
        raise HTTPException(404, "Not found")
    return DB[id]

