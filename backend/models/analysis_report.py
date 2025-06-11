from typing import Optional, Any
from sqlmodel import Field, SQLModel, JSON, Column
from datetime import datetime


class AnalysisReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id")
    report_data: dict = Field(sa_column=Column(JSON))
    llm_summary: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) 