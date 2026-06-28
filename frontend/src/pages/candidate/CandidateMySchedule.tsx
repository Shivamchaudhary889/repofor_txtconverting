import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { useSessions } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const typeColors: Record<string, string> = {
  Lecture: "bg-primary/15 text-primary border-primary/30",
  Lab: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  Assessment:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  Workshop:
    "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  Review:
    "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
};

export default function CandidateMySchedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: sessions = [] } = useSessions();

  useEffect(() => {
    document.title = "My Schedule · Maverick";
  }, []);

  // Show first 12 sessions as "my batch sessions"
  const mySessions = sessions.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Schedule
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Sessions for your batch this week.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            {weekOffset === 0
              ? "This week"
              : weekOffset > 0
              ? `+${weekOffset} wk`
              : `${weekOffset} wk`}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop: weekly grid */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {dayNames.map((day, dayIdx) => {
          const sessions = mySessions
            .filter((s) => s.day === dayIdx + 1)
            .sort((a, b) => a.startHour - b.startHour);
          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{day}</CardTitle>
                <CardDescription className="text-xs">
                  {sessions.length} session{sessions.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                {sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No sessions
                  </p>
                )}
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "p-2 rounded-md border text-xs",
                      typeColors[s.type]
                    )}
                  >
                    <div className="font-mono font-semibold">
                      {s.startHour > 12
                        ? `${s.startHour - 12}:00 PM`
                        : `${s.startHour}:00 AM`}
                    </div>
                    <div className="font-medium mt-1">{s.type}</div>
                    <div className="text-[10px] opacity-80 mt-0.5 truncate">
                      {s.trainerName}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile: stacked list */}
      <div className="md:hidden space-y-4">
        {dayNames.map((day, dayIdx) => {
          const sessions = mySessions
            .filter((s) => s.day === dayIdx + 1)
            .sort((a, b) => a.startHour - b.startHour);
          if (sessions.length === 0) return null;
          return (
            <div key={day}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {fullDayNames[dayIdx]}
              </h3>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className={cn("text-[10px]", typeColors[s.type])}>
                          {s.type}
                        </Badge>
                        <span className="font-mono text-xs font-semibold">
                          {s.startHour > 12
                            ? `${s.startHour - 12}:00 PM`
                            : `${s.startHour}:00 AM`}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          {s.trainerName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {s.durationHours} hr session
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {s.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
