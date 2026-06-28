import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, Users, Layers, Activity } from "lucide-react";
import { useBatches, useCandidates, useTrainers } from "@/hooks/use-data";

function downloadCSV(filename: string, headers: string[], rows: (string | number)[]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const content = [headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Reports() {
  useEffect(() => {
    document.title = "Reports · Maverick";
  }, []);

  const { data: batches = [] } = useBatches();
  const { data: candidates = [] } = useCandidates();
  const { data: trainers = [] } = useTrainers();

  const handleBatchesCSV = () => {
    const headers = ["Batch ID", "Name", "Technology", "Location", "Status", "Start Date", "End Date", "Candidate Count", "Attendance %", "Pass Rate %"];
    const rows = batches.map(b =>
      [b.id, b.name, b.technology, b.location, b.status, b.startDate, b.endDate, b.candidateCount, b.attendancePercent, b.passRate]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    downloadCSV(`maverick-batches-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handleCandidatesCSV = () => {
    const headers = ["Candidate ID", "Name", "Email", "Batch ID", "Performance %", "Attendance %", "Status"];
    const rows = candidates.map(c =>
      [c.id, c.name, c.email, c.batchId, c.performance, c.attendancePercent, c.status]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    downloadCSV(`maverick-candidates-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handleTrainersCSV = () => {
    const headers = ["Trainer ID", "Name", "Email", "Title", "Location", "Utilization %", "Rating", "Skills"];
    const rows = trainers.map(t =>
      [t.id, t.name, t.email, t.title, t.location, t.utilization, t.rating, t.skills.join("; ")]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    downloadCSV(`maverick-trainers-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handleAtRiskCSV = () => {
    const atRisk = candidates.filter(c => c.status === "At Risk" || c.status === "Dropped");
    const headers = ["Candidate ID", "Name", "Email", "Batch ID", "Performance %", "Attendance %", "Status"];
    const rows = atRisk.map(c =>
      [c.id, c.name, c.email, c.batchId, c.performance, c.attendancePercent, c.status]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    downloadCSV(`maverick-at-risk-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const reportsList = [
    {
      title: "All Batches Export",
      desc: `Full data export for all ${batches.length} batches — ID, technology, location, status, dates, attendance, and pass rate.`,
      type: "CSV",
      count: `${batches.length} records`,
      icon: Layers,
      color: "text-blue-500",
      onClick: handleBatchesCSV,
    },
    {
      title: "Candidate Roster",
      desc: `Complete candidate list with performance, attendance, and status for all ${candidates.length} candidates.`,
      type: "CSV",
      count: `${candidates.length} records`,
      icon: Users,
      color: "text-purple-500",
      onClick: handleCandidatesCSV,
    },
    {
      title: "Trainer Utilization",
      desc: `Trainer profiles with skills, utilization rates, and ratings for all ${trainers.length} trainers.`,
      type: "CSV",
      count: `${trainers.length} records`,
      icon: Activity,
      color: "text-emerald-500",
      onClick: handleTrainersCSV,
    },
    {
      title: "At-Risk & Dropped Report",
      desc: "Focused list of candidates flagged as At Risk or Dropped — key input for intervention planning.",
      type: "CSV",
      count: `${candidates.filter(c => c.status === "At Risk" || c.status === "Dropped").length} records`,
      icon: BarChart2,
      color: "text-red-500",
      onClick: handleAtRiskCSV,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Download live data exports from the platform.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          Data as of {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((r, i) => {
          const Icon = r.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${r.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">{r.title}</CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed">{r.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{r.type}</span>
                  <span className="text-xs text-muted-foreground">{r.count}</span>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={r.onClick}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <BarChart2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium">Custom & Scheduled Reports</p>
          <p className="text-sm text-muted-foreground mt-1">Advanced filtering, scheduling, and PDF exports — coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
