import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBatches, useCandidates, useAttendanceRecords, useSaveAttendance } from "@/hooks/use-data";
import { Search, AlertTriangle, CheckCircle2, XCircle, Clock, Save, Loader2, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceStatus } from "@/data/types";

const STATUS_CYCLE: AttendanceStatus[] = ["Present", "Absent", "Late"];

function nextStatus(current: AttendanceStatus): AttendanceStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]!;
}

// null = "Not Marked Yet" (no record exists, no override)
type CellStatus = AttendanceStatus | null;

function StatusButton({
  status,
  onClick,
  disabled,
}: {
  status: CellStatus;
  onClick: () => void;
  disabled?: boolean;
}) {
  if (status === null) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title="Not marked yet — click to mark Present"
        className="h-8 w-8 rounded-md flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 border border-dashed border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="h-4 w-4" />
      </button>
    );
  }
  if (status === "Absent") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title="Absent — click to change"
        className="h-8 w-8 rounded-md flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="h-5 w-5" />
      </button>
    );
  }
  if (status === "Late") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title="Late — click to change"
        className="h-8 w-8 rounded-md flex items-center justify-center bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Clock className="h-5 w-5" />
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Present — click to change"
      className="h-8 w-8 rounded-md flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <CheckCircle2 className="h-5 w-5" />
    </button>
  );
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year!, month! - 1, day!);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}


export default function Attendance() {
  const { data: batches = [] } = useBatches();
  const { data: candidates = [] } = useCandidates();
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const activeBatches = batches.filter(
    (b) => b.status === "In Progress" || b.status === "Planned",
  );

  useEffect(() => {
    document.title = "Attendance · Maverick";
  }, []);

  useEffect(() => {
    if (!selectedBatch && activeBatches.length > 0) {
      setSelectedBatch(activeBatches[0]!.id);
    }
  }, [activeBatches.length, selectedBatch]);

  const { data: rawRecords = [], isLoading: recordsLoading } = useAttendanceRecords(
    selectedBatch || undefined,
  );
  const saveAttendance = useSaveAttendance();

  // Local overrides: key = `${candidateId}::${date}`, value = AttendanceStatus
  const [overrides, setOverrides] = useState<Map<string, AttendanceStatus>>(new Map());

  // Reset local overrides when batch changes
  useEffect(() => {
    setOverrides(new Map());
  }, [selectedBatch]);

  // Build lookup from raw records
  const recordMap = useMemo(() => {
    const m = new Map<string, AttendanceStatus>();
    for (const r of rawRecords) {
      m.set(`${r.candidateId}::${r.date}`, r.status);
    }
    return m;
  }, [rawRecords]);

  /**
   * Date columns = the seeded dates from the API, plus today appended at the
   * end if today is a weekday and doesn't already have records.
   * Each new day the app runs, one new column appears automatically — no more.
   */
  const dates = useMemo(() => {
    const recordDates = [...new Set(rawRecords.map((r) => r.date))].sort();
    const todayStr = todayIso();
    const todayDay = new Date(todayStr).getDay(); // 0=Sun, 6=Sat
    const isWeekday = todayDay !== 0 && todayDay !== 6;
    if (isWeekday && !recordDates.includes(todayStr)) {
      // Today has no saved records yet — pin it at the front so it appears
      // immediately after "Overall %" as the priority column.
      // Once admin marks and saves it, it joins seededDates and sits at the
      // end in chronological order naturally.
      return [todayStr, ...recordDates];
    }
    return recordDates;
  }, [rawRecords]);

  // Which dates are "new" (no record exists for any candidate on that date in this batch)
  const seededDates = useMemo(
    () => new Set(rawRecords.map((r) => r.date)),
    [rawRecords],
  );
  const today = todayIso();

  const batchCandidates = useMemo(
    () => candidates.filter((c) => c.batchId === selectedBatch),
    [candidates, selectedBatch],
  );

  const filteredCandidates = useMemo(
    () =>
      batchCandidates.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [batchCandidates, search],
  );

  function getStatus(candidateId: string, date: string): CellStatus {
    const key = `${candidateId}::${date}`;
    const override = overrides.get(key);
    if (override !== undefined) return override;
    return recordMap.get(key) ?? null;
  }

  function toggleStatus(candidateId: string, date: string) {
    const key = `${candidateId}::${date}`;
    const current = getStatus(candidateId, date);
    setOverrides((prev) => {
      const next = new Map(prev);
      // null (Not Marked) → first click sets Present
      next.set(key, current === null ? "Present" : nextStatus(current));
      return next;
    });
  }

  /**
   * Live attendance % for a candidate:
   * Only dates that have a definite status (not null) are counted.
   * Unmarked future dates don't penalise the % until explicitly marked.
   */
  function computePercent(candidateId: string): number {
    const definedDates = dates.filter((d) => getStatus(candidateId, d) !== null);
    if (definedDates.length === 0) return batchCandidates.find((c) => c.id === candidateId)?.attendancePercent ?? 0;
    const attended = definedDates.filter((d) => getStatus(candidateId, d) !== "Absent").length;
    return Math.round((attended / definedDates.length) * 100);
  }

  // Only count cells that were explicitly changed (overrides)
  const dirtyCount = overrides.size;

  async function handleSave() {
    const records: Array<{
      candidateId: string;
      batchId: string;
      date: string;
      status: AttendanceStatus;
    }> = [];

    for (const [key, status] of overrides.entries()) {
      const [candidateId, date] = key.split("::");
      if (candidateId && date) {
        records.push({ candidateId, batchId: selectedBatch, date, status });
      }
    }

    if (records.length === 0) {
      toast({ title: "No changes to save", description: "Mark some attendance first." });
      return;
    }

    try {
      const result = await saveAttendance.mutateAsync({ records });
      setOverrides(new Map());
      toast({
        title: "Attendance saved",
        description: `${result.updated} candidate${result.updated !== 1 ? "s" : ""} updated. Percentages recalculated across the platform.`,
      });
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    }
  }

  const lowAttendance = batchCandidates.filter((c) => {
    const pct = overrides.size > 0 ? computePercent(c.id) : c.attendancePercent;
    return pct < 85;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Mark daily attendance per candidate. New dates appear automatically each weekday.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveAttendance.isPending || dirtyCount === 0}
        >
          {saveAttendance.isPending ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          Save Changes
          {dirtyCount > 0 && (
            <span className="ml-1.5 bg-white/20 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {dirtyCount}
            </span>
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-full sm:w-[280px] bg-card">
            <SelectValue placeholder="Select a batch" />
          </SelectTrigger>
          <SelectContent>
            {activeBatches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Click a cell to cycle&nbsp;
          <span className="font-medium">– </span>→{" "}
          <span className="text-green-600 font-medium">Present</span> →{" "}
          <span className="text-red-600 font-medium">Absent</span> →{" "}
          <span className="text-amber-600 font-medium">Late</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {recordsLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading attendance data…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium sticky left-0 bg-muted/50 z-10 whitespace-nowrap">
                        Candidate
                      </th>
                      <th className="px-4 py-3 font-medium text-center whitespace-nowrap">
                        Overall %
                      </th>
                      {dates.map((d) => {
                        const isNew = !seededDates.has(d);
                        const isToday = d === today;
                        return (
                          <th
                            key={d}
                            className={`px-4 py-3 font-medium text-center whitespace-nowrap ${
                              isNew
                                ? "text-primary border-b-2 border-primary"
                                : ""
                            }`}
                          >
                            {formatDateLabel(d)}
                            {isToday && (
                              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Today
                              </span>
                            )}
                            {isNew && !isToday && (
                              <span className="ml-1 text-[10px] font-normal text-primary opacity-70">
                                New
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td
                          colSpan={dates.length + 2}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No candidates found.
                        </td>
                      </tr>
                    )}
                    {filteredCandidates.map((c) => {
                      const livePercent = computePercent(c.id);
                      const isLow = livePercent < 85;
                      return (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium sticky left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] whitespace-nowrap">
                            {c.name}
                          </td>
                          <td className="px-4 py-3 text-center font-mono">
                            <span
                              className={
                                isLow
                                  ? "text-red-500 font-bold"
                                  : "text-foreground font-semibold"
                              }
                            >
                              {livePercent}%
                            </span>
                          </td>
                          {dates.map((d) => {
                            const isNew = !seededDates.has(d);
                            return (
                              <td
                                key={d}
                                className={`px-4 py-2 text-center ${
                                  isNew ? "bg-primary/5" : ""
                                }`}
                              >
                                <div className="flex justify-center">
                                  <StatusButton
                                    status={getStatus(c.id, d)}
                                    onClick={() => toggleStatus(c.id, d)}
                                    disabled={saveAttendance.isPending}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {!recordsLoading && dates.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Showing {dates.length} day{dates.length !== 1 ? "s" : ""}.
              Overall % counts only marked days (Present + Late ÷ marked days). Unmarked days (—) are excluded until filled in.
              New weekday columns appear automatically each day.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <Card
            className={`border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50 ${
              lowAttendance.length === 0 ? "opacity-60" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base">
                <AlertTriangle className="h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800/80 dark:text-red-300 mb-4">
                {lowAttendance.length === 0
                  ? "All candidates are above the 85% threshold."
                  : `${lowAttendance.length} candidate${lowAttendance.length !== 1 ? "s" : ""} below 85% threshold.`}
              </p>
              <div className="space-y-3">
                {lowAttendance.map((c) => {
                  const pct = computePercent(c.id);
                  return (
                    <div
                      key={c.id}
                      className="flex justify-between items-center text-sm bg-white dark:bg-card p-2 rounded-md shadow-sm border border-red-100 dark:border-red-900/30"
                    >
                      <span className="font-medium truncate max-w-[120px]">{c.name}</span>
                      <span className="text-red-600 font-mono font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded border border-dashed border-border flex items-center justify-center bg-muted text-muted-foreground">
                  <Minus className="h-3 w-3" />
                </span>
                <span>Not marked yet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900/30">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span>Present — counts toward %</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                  <Clock className="h-4 w-4" />
                </span>
                <span>Late — counts toward %</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/30">
                  <XCircle className="h-4 w-4" />
                </span>
                <span>Absent — reduces %</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
