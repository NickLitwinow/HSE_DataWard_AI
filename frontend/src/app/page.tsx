import ReportsList from "@/components/reports-list";
import Sidebar from "@/components/layout/sidebar";

export default function Home() {
  return (
    <div>
      <Sidebar />
      <main className="ml-[220px] lg:ml-[280px] p-4 lg:p-6">
        <div className="flex items-center mb-4">
          <h1 className="text-lg font-semibold md:text-2xl">Analysis Reports</h1>
        </div>
        <ReportsList />
      </main>
    </div>
  );
} 