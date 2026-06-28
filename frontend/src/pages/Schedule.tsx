import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  User,
  Filter,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useSessions, useTrainers } from "@/hooks/use-data";
import type { ScheduleSession } from "@/data/types";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8 AM - 6 PM

const typeStyles: Record<ScheduleSession["type"], string> = {
  Lecture:
    "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15",
  Lab: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15",
  Assessment:
    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/15",
  Workshop:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/15",
  Review:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/15",
};

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${period}`;
}

function getWeekRange(weekOffset: number) {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day - 1) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function formatRange(monday: Date, sunday: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };
  return `${monday.toLocaleDateString(undefined, opts)} – ${sunday.toLocaleDateString(undefined, yearOpts)}`;
}

export default function Schedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [trainerFilter, setTrainerFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ScheduleSession | null>(null);
  const { data: sessions = [] } = useSessions();
  const { data: trainers = [] } = useTrainers();

  useEffect(() => {
    document.title = "Schedule · Maverick";
  }, []);

  const { monday, sunday } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (trainerFilter !== "all" && s.trainerId !== trainerFilter) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      return true;
    });
  }, [sessions, trainerFilter, typeFilter]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, ScheduleSession[]>();
    for (let d = 1; d <= 7; d++) map.set(d, []);
    filtered.forEach((s) => {
      const arr = map.get(s.day) ?? [];
      arr.push(s);
      map.set(s.day, arr);
    });
    return map;
  }, [filtered]);

  const conflictIds = useMemo(() => {
    const conflicts = new Set<string>();
    const byDay = new Map<number, ScheduleSession[]>();
    filtered.forEach((s) => {
      const arr = byDay.get(s.day) ?? [];
      arr.push(s);
      byDay.set(s.day, arr);
    });
    byDay.forEach((arr) => {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          if (a.trainerId !== b.trainerId) continue;
          const aEnd = a.startHour + a.durationHours;
          const bEnd = b.startHour + b.durationHours;
          if (a.startHour < bEnd && b.startHour < aEnd) {
            conflicts.add(a.id);
            conflicts.add(b.id);
          }
        }
      }
    });
    return conflicts;
  }, [filtered]);

  const today = new Date();
  const todayDay = today.getDay() || 7;
  const isCurrentWeek = weekOffset === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Weekly view of all training sessions across active batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-card min-w-[200px] justify-center">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium tabular-nums">
              {formatRange(monday, sunday)}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant={isCurrentWeek ? "secondary" : "default"}
            onClick={() => setWeekOffset(0)}
            disabled={isCurrentWeek}
            className="ml-2"
          >
            Today
          </Button>
        </div>
      </div>

      {conflictIds.size > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-destructive">
              {conflictIds.size} session{conflictIds.size === 1 ? "" : "s"} have a trainer conflict this week.
            </div>
            <div className="text-muted-foreground mt-0.5">
              The same trainer is double-booked across overlapping sessions. Conflicting sessions are marked in red.
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <Select value={trainerFilter} onValueChange={setTrainerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All trainers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trainers</SelectItem>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(["Lecture", "Lab", "Assessment", "Workshop", "Review"] as const).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
            {(Object.keys(typeStyles) as ScheduleSession["type"][]).map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span
                  className={cn("h-2.5 w-2.5 rounded-sm border", typeStyles[t])}
                />
                <span className="text-muted-foreground">{t}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="hidden md:block">
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border">
            <div className="border-r border-border p-3 text-xs font-medium text-muted-foreground">
              Time
            </div>
            {DAYS.map((day, i) => {
              const isToday = isCurrentWeek && i + 1 === todayDay;
              const date = new Date(monday);
              date.setDate(monday.getDate() + i);
              return (
                <div
                  key={day}
                  className={cn(
                    "p-3 text-center border-r border-border last:border-r-0",
                    isToday && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {day}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold tabular-nums mt-0.5",
                      isToday && "text-primary"
                    )}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border last:border-b-0 min-h-[72px]"
              >
                <div className="border-r border-border p-2 text-[11px] text-muted-foreground tabular-nums">
                  {formatHour(hour)}
                </div>
                {DAYS.map((_, i) => {
                  const dayNum = i + 1;
                  const sessionsThisHour = (sessionsByDay.get(dayNum) ?? []).filter(
                    (s) => s.startHour === hour
                  );
                  const isToday = isCurrentWeek && dayNum === todayDay;
                  const count = sessionsThisHour.length;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "border-r border-border last:border-r-0 p-1 relative",
                        isToday && "bg-primary/5"
                      )}
                    >
                      {sessionsThisHour.map((s, idx) => {
                        const widthPct = 100 / count;
                        const leftPct = idx * widthPct;
                        const hasConflict = conflictIds.has(s.id);
                        return (
                          <motion.button
                            key={s.id}
                            layout
                            whileHover={{ scale: 1.02, zIndex: 20 }}
                            onClick={() => setSelected(s)}
                            style={{
                              height: `${s.durationHours * 72 - 8}px`,
                              width: `calc(${widthPct}% - 4px)`,
                              left: `calc(${leftPct}% + 2px)`,
                            }}
                            className={cn(
                              "text-left rounded-md border px-2 py-1.5 text-[11px] leading-tight transition-colors absolute top-1 z-10 overflow-hidden",
                              typeStyles[s.type],
                              hasConflict &&
                                "ring-2 ring-destructive border-destructive/60"
                            )}
                          >
                            <div className="flex items-start gap-1">
                              <div className="font-semibold truncate flex-1">
                                {s.batchName}
                              </div>
                              {hasConflict && (
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] opacity-80 truncate">
                              {s.trainerName}
                            </div>
                            <div className="text-[10px] opacity-70 mt-0.5 truncate">
                              {s.type}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden divide-y divide-border">
          {DAYS.map((day, i) => {
            const sessions = (sessionsByDay.get(i + 1) ?? []).sort(
              (a, b) => a.startHour - b.startHour
            );
            const isToday = isCurrentWeek && i + 1 === todayDay;
            return (
              <div key={day} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {day}
                  </div>
                  {isToday && (
                    <Badge className="bg-primary/15 text-primary border-primary/30">
                      Today
                    </Badge>
                  )}
                </div>
                {sessions.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">
                    No sessions scheduled.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s) => {
                      const hasConflict = conflictIds.has(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelected(s)}
                          className={cn(
                            "w-full text-left rounded-md border px-3 py-2 transition-colors",
                            typeStyles[s.type],
                            hasConflict &&
                              "ring-2 ring-destructive border-destructive/60"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-sm flex items-center gap-1.5 min-w-0">
                              {hasConflict && (
                                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                              )}
                              <span className="truncate">{s.batchName}</span>
                            </div>
                            <div className="text-[11px] tabular-nums shrink-0">
                              {formatHour(s.startHour)}
                            </div>
                          </div>
                          <div className="text-[11px] mt-1 opacity-80 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {s.trainerName}
                            </span>
                            <span>{s.type}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center p-0 md:p-6"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-t-2xl md:rounded-xl w-full max-w-lg shadow-xl overflow-hidden"
          >
            <div className={cn("h-1.5", typeStyles[selected.type].split(" ")[0])} />
            <div className="p-6 space-y-4">
              <div>
                <Badge className={cn("mb-2", typeStyles[selected.type])}>
                  {selected.type}
                </Badge>
                <h3 className="text-xl font-semibold">{selected.batchName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.technology}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm border-t border-border">
                <div className="flex items-start gap-2 pt-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-xs">Time</div>
                    <div className="font-medium">
                      {DAYS[selected.day - 1]} · {formatHour(selected.startHour)} –{" "}
                      {formatHour(selected.startHour + selected.durationHours)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-xs">Trainer</div>
                    <div className="font-medium">{selected.trainerName}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-xs">Location</div>
                    <div className="font-medium">{selected.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-xs">Duration</div>
                    <div className="font-medium">{selected.durationHours}h session</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button>Open batch</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
