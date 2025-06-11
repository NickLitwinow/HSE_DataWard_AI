from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from database import engine
from api import data_sources, files, reports


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


app = FastAPI(
    title="DataWard AI API",
    description="API for DataWard AI, a service for automated data quality monitoring.",
    version="0.1.0",
    on_startup=[create_db_and_tables],
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(data_sources.router, prefix="/api/data_sources", tags=["Data Sources"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
async def read_root():
    return {"message": "Welcome to DataWard AI"} 