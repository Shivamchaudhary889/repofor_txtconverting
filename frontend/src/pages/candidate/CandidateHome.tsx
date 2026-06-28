import { useEffect } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Trophy,
  CalendarDays,
  FileText,
  ArrowRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useSessions, useCandidate } from "@/hooks/use-data";
import { ProgressNarrativeCard } from "@/components/ai/ProgressNarrativeCard";
import { CareerCoachCard } from "@/components/ai/CareerCoachCard";
import { getSession } from "@/lib/auth";

const CANDIDATE_FALLBACK = {
  id: "c-1",
  name: "Kishlay Kumar",
  cohort: "HX-JAVA-MUM-124",
  technology: "Java Full Stack",
  attendance: 94,
  performance: 87,
  streak: 12,
  rank: 4,
  totalInBatch: 28,
  modulesComplete: 7,
  totalModules: 12,
};

export default function CandidateHome() {
  useEffect(() => {
    document.title = "Home · Maverick";
  }, []);

  const session = getSession();
  const candidateId = session?.role === "candidate" ? session.id : CANDIDATE_FALLBACK.id;
  const { data: candidateData } = useCandidate(candidateId);

  const CANDIDATE = {
    id: candidateId,
    name: candidateData?.name ?? session?.name ?? CANDIDATE_FALLBACK.name,
    cohort: CANDIDATE_FALLBACK.cohort,
    technology: CANDIDATE_FALLBACK.technology,
    attendance: candidateData?.attendancePercent ?? CANDIDATE_FALLBACK.attendance,
    performance: candidateData ? Math.round(candidateData.performance) : CANDIDATE_FALLBACK.performance,
    streak: CANDIDATE_FALLBACK.streak,
    rank: CANDIDATE_FALLBACK.rank,
    totalInBatch: CANDIDATE_FALLBACK.totalInBatch,
    modulesComplete: CANDIDATE_FALLBACK.modulesComplete,
    totalModules: CANDIDATE_FALLBACK.totalModules,
  };

  const { data: sessions = [] } = useSessions();
  const todaySessions = sessions.slice(0, 3);
  const upcomingAssessments = [
    { id: 1, title: "Spring Boot REST APIs", due: "Tomorrow, 11:00 AM", type: "Quiz" },
    { id: 2, title: "Hibernate ORM Practical", due: "Fri, 26 Apr · 2:00 PM", type: "Lab" },
    { id: 3, title: "Mid-batch Capstone", due: "Mon, 29 Apr · 10:00 AM", type: "Project" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back, {CANDIDATE.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {CANDIDATE.cohort} · {CANDIDATE.technology}
        </p>
      </div>

      <ProgressNarrativeCard candidateId={CANDIDATE.id} />

      <CareerCoachCard candidateId={CANDIDATE.id} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Attendance
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {CANDIDATE.attendance}%
            </div>
            <Progress value={CANDIDATE.attendance} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Performance
              </span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {CANDIDATE.performance}%
            </div>
            <Progress value={CANDIDATE.performance} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Streak
              </span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {CANDIDATE.streak} days
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep it going!</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Cohort Rank
              </span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              #{CANDIDATE.rank}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {CANDIDATE.totalInBatch}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Module progress</CardTitle>
                <CardDescription>
                  {CANDIDATE.modulesComplete} of {CANDIDATE.totalModules} modules
                  complete
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/batch">
                  View all
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Java Fundamentals", status: "done", grade: "A" },
                { name: "OOP & Collections", status: "done", grade: "A-" },
                { name: "Spring Core & Boot", status: "in-progress", grade: null },
                { name: "REST APIs & Security", status: "in-progress", grade: null },
                { name: "Hibernate & JPA", status: "upcoming", grade: null },
                { name: "Microservices", status: "upcoming", grade: null },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-md border border-border bg-card"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      m.status === "done"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : m.status === "in-progress"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {m.status.replace("-", " ")}
                    </div>
                  </div>
                  {m.grade && (
                    <Badge variant="outline" className="font-mono">
                      {m.grade}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-md border border-border bg-card"
                >
                  <div className="text-xs font-mono shrink-0 w-12 text-muted-foreground">
                    {s.startHour > 12
                      ? `${s.startHour - 12}:00P`
                      : `${s.startHour}:00A`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{s.type}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.trainerName}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/schedule">
                  Open schedule
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Upcoming Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssessments.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-md border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{a.title}</div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {a.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {a.due}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
