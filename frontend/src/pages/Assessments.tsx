import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAssessments, useBatches } from "@/hooks/use-data";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GenerateQuestionsDialog } from "@/components/ai/GenerateQuestionsDialog";

export default function Assessments() {
  useEffect(() => {
    document.title = "Assessments · Maverick";
  }, []);

  const { data: assessments = [] } = useAssessments();
  const { data: batches = [] } = useBatches();

  const pending = assessments.filter(a => a.status === "Pending").length;
  const avgPassRate = assessments.length
    ? Math.round(
        assessments.filter(a => a.status !== "Pending").reduce((acc, a) => acc + a.passRate, 0) /
          Math.max(1, assessments.filter(a => a.status !== "Pending").length)
      )
    : 0;

  const batchName = (id: string) => batches.find(b => b.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground mt-1">Manage evaluations and track candidate scores.</p>
        </div>
        <GenerateQuestionsDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Grading</p>
              <div className="text-2xl font-bold font-mono mt-1">{pending}</div>
            </div>
            <Clock className="h-8 w-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Pass Rate</p>
              <div className="text-2xl font-bold font-mono mt-1">{avgPassRate}%</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
              <div className="text-2xl font-bold font-mono mt-1">{assessments.length}</div>
            </div>
            <FileText className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment Name</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((a) => (
              <TableRow key={a.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="text-muted-foreground">{batchName(a.batchId)}</TableCell>
                <TableCell>{a.date}</TableCell>
                <TableCell className="font-mono">
                  {a.status === "Pending" ? "-" : `${a.passRate}%`}
                </TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
