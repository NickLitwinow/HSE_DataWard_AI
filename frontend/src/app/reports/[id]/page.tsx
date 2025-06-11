'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisReport, ColumnProfile } from '@/types/analysis-report';
import Sidebar from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiUrl } from '@/lib/api';

async function getReport(id: string): Promise<AnalysisReport> {
    const res = await fetch(`${apiUrl}/api/reports/${id}`);
    if (!res.ok) {
        throw new Error('Failed to fetch report');
    }
    return res.json();
}

const getQualityBadgeVariant = (score: number): "success" | "secondary" | "destructive" => {
    if (score >= 8) return "success";
    if (score >= 5) return "secondary";
    return "destructive";
};

export default function ReportPage() {
    const params = useParams();
    const id = params.id as string;
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            getReport(id)
                .then(data => setReport(data))
                .catch(err => {
                    console.error(err);
                    setError("Could not load report. Is the backend running or the report ID valid?");
                });
        }
    }, [id]);

    if (error) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    if (!report) {
        return <div className="p-8">Loading report...</div>;
    }

    const { report_data, llm_summary, name } = report;

    return (
        <div>
            <Sidebar />
            <main className="ml-[220px] lg:ml-[280px] p-4 lg:p-6">
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center">
                        <h1 className="text-lg font-semibold md:text-2xl">
                            {name ? `Report for ${name}` : `Report #${report.id}`}
                        </h1>
                    </div>

                    {llm_summary && !llm_summary.error && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>AI-Powered Summary</span>
                                    {typeof llm_summary.overall_quality_score === 'number' && (
                                        <Badge variant={getQualityBadgeVariant(llm_summary.overall_quality_score)}>
                                            Quality Score: {llm_summary.overall_quality_score}/10
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.isArray(llm_summary.key_issues) && llm_summary.key_issues.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">Key Issues</h3>
                                        <ul className="list-disc pl-5 text-muted-foreground">
                                            {llm_summary.key_issues.map((issue, index) => <li key={index}>{issue}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {Array.isArray(llm_summary.recommendations) && llm_summary.recommendations.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">Recommendations</h3>
                                        <ul className="list-disc pl-5 text-muted-foreground">
                                            {llm_summary.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {llm_summary && llm_summary.error && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Summary Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-500">{llm_summary.error}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader><CardTitle>Rows</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{report_data.num_rows}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Columns</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{report_data.num_columns}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Duplicate Rows</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{report_data.num_duplicate_rows}</p></CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Column Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Column Name</TableHead>
                                        <TableHead>Data Type</TableHead>
                                        <TableHead>Missing</TableHead>
                                        <TableHead>Unique Values</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(report_data.column_profiles).map(([col, profile]: [string, ColumnProfile]) => (
                                        <TableRow key={col}>
                                            <TableCell className="font-medium">{col}</TableCell>
                                            <TableCell>{profile.dtype}</TableCell>
                                            <TableCell>{`${profile.missing_values_percentage.toFixed(2)}%`}</TableCell>
                                            <TableCell>{profile.unique_values}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
} 