export interface ColumnProfile {
    dtype: string;
    missing_values: number;
    missing_values_percentage: number;
    unique_values: number;
    [key: string]: any; // for other stats like min, max, mean, etc.
}

export interface DataFrameProfile {
    num_rows: number;
    num_columns: number;
    num_duplicate_rows: number;
    column_profiles: {
        [column_name: string]: ColumnProfile;
    };
}

export interface LLMSummary {
    overall_quality_score?: number;
    key_issues?: string[];
    recommendations?: string[];
    error?: string;
}

export interface AnalysisReport {
    id: number;
    data_source_id: number;
    report_data: DataFrameProfile;
    llm_summary: LLMSummary | null;
    created_at: string;
    name?: string; // Optional name from data source
} 