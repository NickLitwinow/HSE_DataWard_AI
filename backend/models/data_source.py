import enum
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class DataSourceType(str, enum.Enum):
    POSTGRESQL = "postgresql"
    CLICKHOUSE = "clickhouse"
    MONGODB = "mongodb"
    FILE = "file"


class DataSource(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: DataSourceType
    connection_string: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) 