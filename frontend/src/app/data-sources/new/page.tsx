'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";

export default function NewDataSourcePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const router = useRouter();


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${apiUrl}/api/files/`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "File upload failed");
            }

            const result = await response.json();
            setAnalysisResult(result);
            // Optionally, redirect to the report page
            // router.push(`/reports/${result.id}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Sidebar />
            <main className="ml-[220px] lg:ml-[280px] p-4 lg:p-6">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Add New Data Source</h1>
                </div>
                <div className="flex flex-1 items-start justify-center py-8">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Upload a File</CardTitle>
                            <CardDescription>
                                Upload a CSV, Parquet, or XLSX file to begin analysis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="file">File</Label>
                                    <Input id="file" type="file" onChange={handleFileChange} />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Analyzing..." : "Upload and Analyze"}
                                </Button>
                            </form>
                            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                            {analysisResult && (
                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <h3 className="text-lg font-semibold">Analysis Complete!</h3>
                                    <p className="text-sm text-muted-foreground">Report ID: {analysisResult.id}</p>
                                    <Button className="mt-2" variant="outline" onClick={() => router.push('/')}>
                                        View All Reports
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
} 