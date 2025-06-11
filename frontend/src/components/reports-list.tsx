'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisReport } from "@/types/analysis-report";
import { apiUrl } from "@/lib/api";


async function getReports(): Promise<AnalysisReport[]> {
    const res = await fetch(`${apiUrl}/api/reports/`);
    if (!res.ok) {
        throw new Error('Failed to fetch reports');
    }
    const reports = await res.json();
    return reports;
}


export default function ReportsList() {
    const [reports, setReports] = useState<AnalysisReport[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        getReports()
            .then(data => setReports(data))
            .catch(err => {
                console.error(err);
                setError("Could not load reports. Is the backend running?");
            });
    }, []);


    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    if (reports.length === 0) {
        return (
            <div className="text-center text-muted-foreground">
                <p>No reports found.</p>
                <Button className="mt-4" onClick={() => router.push('/data-sources/new')}>Add Data Source</Button>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader>
                        <CardTitle>{report.name || `Report #${report.id}`}</CardTitle>
                        <CardDescription>
                            Rows: {report.report_data.num_rows} | Columns: {report.report_data.num_columns}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Analyzed: {new Date(report.created_at).toLocaleString()}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => router.push(`/reports/${report.id}`)}>
                            View Report
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
} 