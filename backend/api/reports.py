from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models.analysis_report import AnalysisReport

router = APIRouter()


@router.get("/", response_model=List[AnalysisReport])
def get_reports(session: Session = Depends(get_session)):
    """
    Get a list of all analysis reports.
    """
    reports = session.exec(select(AnalysisReport)).all()
    return reports


@router.get("/{report_id}", response_model=AnalysisReport)
def get_report(report_id: int, session: Session = Depends(get_session)):
    """
    Get a single analysis report by its ID.
    """
    report = session.get(AnalysisReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report 