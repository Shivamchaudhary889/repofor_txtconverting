import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useCandidate, useBatch } from "@/hooks/use-data";
import { Mail, Phone, MapPin, Award, BookOpen, Activity, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { RiskNarrativeCard } from "@/components/ai/RiskNarrativeCard";

export default function CandidateDetail() {
  const [, params] = useRoute("/candidates/:id");
  const candidateId = params?.id;

  const { data: candidate, isLoading } = useCandidate(candidateId);
  const { data: batch } = useBatch(candidate?.batchId);

  useEffect(() => {
    document.title = `${candidate?.name || 'Candidate'} · Maverick`;
  }, [candidate]);

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!candidate) return <div>Candidate not found</div>;

  const radarData = [
    { subject: 'Technical', A: 85, fullMark: 100 },
    { subject: 'Communication', A: 92, fullMark: 100 },
    { subject: 'Problem Solving', A: 78, fullMark: 100 },
    { subject: 'Teamwork', A: 88, fullMark: 100 },
    { subject: 'Punctuality', A: candidate.attendancePercent, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href="/candidates"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback className="text-xl">{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{candidate.name}</h2>
                <div className="mt-2 mb-4">
                  <StatusBadge status={candidate.status} />
                </div>

                <div className="w-full space-y-3 mt-4 pt-4 border-t border-border text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{batch?.location || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Batch</CardTitle>
            </CardHeader>
            <CardContent>
              {batch ? (
                <div className="space-y-3">
                  <Link href={`/batches/${batch.id}`} className="font-medium text-primary hover:underline block">
                    {batch.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{batch.technology}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-md mt-2">
                    <BookOpen className="h-4 w-4" />
                    Started {new Date(batch.startDate).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not currently assigned to a batch.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Overall Performance</p>
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono">{candidate.performance}%</div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${candidate.performance}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono">{candidate.attendancePercent}%</div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${candidate.attendancePercent}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <RiskNarrativeCard candidateId={candidate.id} />

          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <Radar name="Candidate" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
