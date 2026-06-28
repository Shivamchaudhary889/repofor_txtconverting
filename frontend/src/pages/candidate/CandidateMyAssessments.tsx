import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Target,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PracticePanel } from "@/components/ai/PracticePanel";

const upcoming = [
  {
    id: 1,
    title: "Spring Boot REST APIs",
    type: "Quiz",
    duration: "30 min",
    questions: 25,
    due: "Tomorrow, 11:00 AM",
    weight: "10%",
  },
  {
    id: 2,
    title: "Hibernate ORM Practical",
    type: "Lab",
    duration: "90 min",
    questions: 5,
    due: "Fri, 26 Apr · 2:00 PM",
    weight: "15%",
  },
  {
    id: 3,
    title: "Mid-batch Capstone",
    type: "Project",
    duration: "3 days",
    questions: 1,
    due: "Mon, 29 Apr · 10:00 AM",
    weight: "25%",
  },
];

const completed = [
  { id: 4, title: "Java Fundamentals", type: "Quiz", score: 92, max: 100, date: "12 Apr" },
  { id: 5, title: "OOP & Collections", type: "Quiz", score: 88, max: 100, date: "16 Apr" },
  { id: 6, title: "Stream API Workshop", type: "Lab", score: 18, max: 20, date: "19 Apr" },
  { id: 7, title: "Spring Core", type: "Quiz", score: 21, max: 25, date: "22 Apr" },
];

export default function CandidateMyAssessments() {
  useEffect(() => {
    document.title = "My Assessments · Maverick";
  }, []);

  const totalScore = completed.reduce((acc, a) => acc + a.score, 0);
  const totalMax = completed.reduce((acc, a) => acc + a.max, 0);
  const avg = Math.round((totalScore / totalMax) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Assessments
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Quizzes, labs, and projects scheduled for your batch.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Average
              </span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">{avg}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {completed.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Upcoming
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {upcoming.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Trend
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono mt-1">+4%</div>
          </CardContent>
        </Card>
      </div>

      <PracticePanel defaultTopic="Spring Boot REST APIs" />

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-card border-b border-border rounded-none h-auto p-0 mb-4 w-full justify-start">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3"
          >
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3"
          >
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{a.title}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {a.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    >
                      {a.weight}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.due}
                    </span>
                    <span>{a.duration}</span>
                    <span>{a.questions} item{a.questions === 1 ? "" : "s"}</span>
                  </div>
                </div>
                <Button size="sm" className="shrink-0 self-start sm:self-auto">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.map((a) => {
            const pct = Math.round((a.score / a.max) * 100);
            return (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{a.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {a.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Submitted {a.date}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold font-mono">
                        {a.score}
                        <span className="text-muted-foreground text-sm">
                          /{a.max}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          pct >= 85
                            ? "text-emerald-600 dark:text-emerald-400"
                            : pct >= 70
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-destructive"
                        }`}
                      >
                        {pct}%
                      </div>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
