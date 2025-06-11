import pandas as pd
from pydantic import BaseModel


class ColumnProfile(BaseModel):
    dtype: str
    missing_values: int
    missing_values_percentage: float
    unique_values: int


class DataFrameProfile(BaseModel):
    num_rows: int
    num_columns: int
    num_duplicate_rows: int
    column_profiles: dict[str, ColumnProfile]


def profile_dataframe(df: pd.DataFrame) -> DataFrameProfile:
    num_rows, num_columns = df.shape
    num_duplicate_rows = df.duplicated().sum()

    column_profiles = {}
    for col in df.columns:
        missing_values = df[col].isnull().sum()
        column_profiles[col] = ColumnProfile(
            dtype=str(df[col].dtype),
            missing_values=int(missing_values),
            missing_values_percentage=float(missing_values / num_rows) * 100,
            unique_values=df[col].nunique(),
        )

    return DataFrameProfile(
        num_rows=num_rows,
        num_columns=num_columns,
        num_duplicate_rows=int(num_duplicate_rows),
        column_profiles=column_profiles,
    ) 