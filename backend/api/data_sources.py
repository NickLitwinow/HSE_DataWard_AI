from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models.data_source import DataSource
from models.analysis_report import AnalysisReport
from core.llm import generate_llm_analysis, LLMAnalysis
from core.profiler import DataFrameProfile

router = APIRouter()


@router.post("/", response_model=DataSource)
def create_data_source(
    data_source: DataSource, session: Session = Depends(get_session)
):
    session.add(data_source)
    session.commit()
    session.refresh(data_source)
    return data_source


@router.get("/", response_model=List[DataSource])
def get_data_sources(session: Session = Depends(get_session)):
    data_sources = session.exec(select(DataSource)).all()
    return data_sources


@router.get(
    "/{data_source_id}/reports", response_model=List[AnalysisReport]
)
def read_reports_for_data_source(
    data_source_id: int, session: Session = Depends(get_session)
):
    reports = session.exec(
        select(AnalysisReport).where(AnalysisReport.data_source_id == data_source_id)
    ).all()
    return reports


@router.post(
    "/reports/{report_id}/generate_llm_summary", response_model=AnalysisReport
)
def generate_llm_summary_for_report(
    report_id: int, session: Session = Depends(get_session)
):
    report = session.get(AnalysisReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Assuming report_data is the DataFrameProfile dict
    profile_data = DataFrameProfile(**report.report_data)
    llm_summary = generate_llm_analysis(profile_data)

    # Add the LLM summary to the report data
    report.report_data["llm_summary"] = llm_summary.dict()
    session.add(report)
    session.commit()
    session.refresh(report)

    return report 