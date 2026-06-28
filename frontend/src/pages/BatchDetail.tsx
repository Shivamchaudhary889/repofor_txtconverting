import { useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { useBatch, useCandidates, useTrainer } from "@/hooks/use-data";
import { Users, Calendar, MapPin, Target, CheckCircle2, Clock, CheckCircle, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackThemesCard } from "@/components/ai/FeedbackThemesCard";

export default function BatchDetail() {
  const [, params] = useRoute("/batches/:id");
  const batchId = params?.id;

  const { data: batch, isLoading } = useBatch(batchId);
  const { data: trainer } = useTrainer(batch?.trainerId);
  const { data: allCandidates = [] } = useCandidates();
  const candidates = batch ? allCandidates.filter(c => c.batchId === batch.id) : [];

  useEffect(() => {
    document.title = `${batch?.name || 'Batch'} · Maverick`;
  }, [batch]);

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!batch) return <div>Batch not found</div>;

  // Compute batch progress (0–1) for milestone rendering
  const now = new Date();
  const batchStart = new Date(batch.startDate);
  const batchEnd = new Date(batch.endDate);
  const totalMs = Math.max(1, batchEnd.getTime() - batchStart.getTime());
  const elapsedMs = now.getTime() - batchStart.getTime();
  const batchProgress =
    batch.status === "Completed" || batch.status === "Archived" ? 1.0
    : batch.status === "Planned" ? 0
    : Math.max(0, Math.min(1, elapsedMs / totalMs));

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const milestones = [
    { label: "Orientation & Setup", threshold: 0.0, date: fmt(batch.startDate) },
    { label: "Core Technology Fundamentals", threshold: 0.25, date: fmt(new Date(batchStart.getTime() + totalMs * 0.25).toISOString().slice(0,10)) },
    { label: "Mid-term Assessment", threshold: 0.5, date: fmt(new Date(batchStart.getTime() + totalMs * 0.5).toISOString().slice(0,10)) },
    { label: "Advanced Topics & Labs", threshold: 0.72, date: fmt(new Date(batchStart.getTime() + totalMs * 0.72).toISOString().slice(0,10)) },
    { label: "Final Capstone Project", threshold: 0.88, date: fmt(batch.endDate) },
  ].map(m => ({
    ...m,
    done: batchProgress > m.threshold + 0.05,
    current: !batchProgress || batchProgress > m.threshold - 0.05 && batchProgress <= m.threshold + 0.05,
  }));

  const overallProgress = Math.round(batchProgress * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
            <StatusBadge status={batch.status} />
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>{batch.technology}</span>
            <span>•</span>
            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {batch.location}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Candidates</p>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Attendance</p>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono">{batch.attendancePercent}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono">{batch.passRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Timeline</p>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-sm font-medium">
              {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -
              {new Date(batch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-card w-full justify-start border-b border-border rounded-none h-auto p-0">
          <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">Overview</TabsTrigger>
          <TabsTrigger value="candidates" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">Candidates ({candidates.length})</TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">AI Feedback</TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Avg. Assessment Score</span>
                      <span className="text-sm text-muted-foreground">{batch.passRate}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${batch.passRate}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-4">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="relative pl-6">
                      {m.done ? (
                        <CheckCircle className="absolute left-[-9px] top-0.5 h-4 w-4 text-primary" />
                      ) : m.current && batchProgress > 0 ? (
                        <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background animate-pulse" />
                      ) : (
                        <Circle className="absolute left-[-9px] top-0.5 h-4 w-4 text-muted-foreground/40" />
                      )}
                      <h4 className={`text-sm font-semibold ${!m.done && !(m.current && batchProgress > 0) ? "text-muted-foreground" : ""}`}>
                        {m.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {m.done ? `Completed · ${m.date}` : (m.current && batchProgress > 0) ? `In progress · ${m.date}` : `Upcoming · ${m.date}`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Trainer</CardTitle>
              </CardHeader>
              <CardContent>
                {trainer && (
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={trainer.avatar} />
                      <AvatarFallback>{trainer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{trainer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{trainer.title}</p>
                    <div className="w-full pt-4 border-t border-border flex justify-around text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="font-medium font-mono">{trainer.rating}/5.0</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Batches</p>
                        <p className="font-medium font-mono">{trainer.currentBatches}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="pt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Performance</th>
                    <th className="px-4 py-3 font-medium">Attendance</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback>{c.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{c.performance}%</td>
                      <td className="px-4 py-3 font-mono">{c.attendancePercent}%</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="pt-6">
          <FeedbackThemesCard batchId={batch.id} />
        </TabsContent>

        <TabsContent value="schedule" className="pt-6">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p>Schedule view is under construction.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
