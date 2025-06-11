from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session
import pandas as pd
from datetime import datetime

from core.profiler import profile_dataframe, DataFrameProfile
from core.llm_client import get_llm_analysis
from database import get_session
from models.data_source import DataSource, DataSourceType
from models.analysis_report import AnalysisReport

router = APIRouter()


@router.post("/", response_model=AnalysisReport)
async def upload_file_and_profile(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    # 1. Create a new DataSource entry for the file
    data_source = DataSource(
        name=file.filename,
        type=DataSourceType.FILE,
    )
    session.add(data_source)
    session.commit()
    session.refresh(data_source)

    # 2. Read and profile the file
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        elif file.filename.endswith(".parquet"):
            df = pd.read_parquet(file.file)
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file.file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a CSV, Parquet, or Excel file.",
            )
    except Exception as e:
        # Rollback the session to cancel the DataSource creation if file processing fails
        session.rollback()
        raise HTTPException(
            status_code=400, detail=f"Error reading or parsing file: {e}"
        )

    profile = profile_dataframe(df)
    llm_summary = await get_llm_analysis(profile)

    # 3. Create and save the analysis report
    report = AnalysisReport(
        data_source_id=data_source.id, 
        report_data=profile.dict(),
        llm_summary=llm_summary,
    )
    session.add(report)
    session.commit()
    session.refresh(report)

    return report 