import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, CalendarDays, Users, Star, Mail } from "lucide-react";
import { useTrainers, useCandidates } from "@/hooks/use-data";
import { avatarInitials } from "@/lib/avatar";
import { AITutorPanel } from "@/components/ai/AITutorPanel";

const BATCH = {
  name: "HX-JAVA-MUM-124",
  technology: "Java Full Stack",
  location: "Mumbai",
  startDate: "08 Apr 2026",
  endDate: "30 Jun 2026",
  weeks: 12,
  weekNumber: 4,
};

export default function CandidateMyBatch() {
  useEffect(() => {
    document.title = "My Batch · Maverick";
  }, []);

  const { data: trainers = [] } = useTrainers();
  const { data: candidates = [] } = useCandidates();
  const trainer = trainers[0];
  const peers = candidates.slice(0, 27);
  const progressPct = Math.round((BATCH.weekNumber / BATCH.weeks) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {BATCH.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {BATCH.technology}
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 self-start sm:self-auto">
          In Progress · Week {BATCH.weekNumber} of {BATCH.weeks}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cohort progress</span>
            <span className="text-sm font-mono text-muted-foreground">
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Stat icon={CalendarDays} label="Starts" value={BATCH.startDate} />
            <Stat icon={CalendarDays} label="Ends" value={BATCH.endDate} />
            <Stat icon={MapPin} label="Location" value={BATCH.location} />
            <Stat icon={Users} label="Cohort size" value={`${peers.length + 1}`} />
          </div>
        </CardContent>
      </Card>

      <AITutorPanel topic={BATCH.technology} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {trainer && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Lead Trainer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 bg-white">
                  <AvatarImage src={trainer.avatar} />
                  <AvatarFallback>{avatarInitials(trainer.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{trainer.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {trainer.title}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{trainer.rating}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{trainer.email}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cohort peers</CardTitle>
            <CardDescription>
              {peers.length} other candidates in your batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {peers.slice(0, 12).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-md border border-border bg-card"
                >
                  <Avatar className="h-9 w-9 bg-white shrink-0">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="text-xs">
                      {avatarInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.performance}% perf
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {peers.length > 12 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                + {peers.length - 12} more peers in your batch
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border rounded-md p-3 bg-muted/30">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm font-semibold mt-1 truncate">{value}</div>
    </div>
  );
}
