import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Layers,
  CalendarDays,
  GraduationCap,
  Users,
  ClipboardCheck,
  Star,
  Upload,
  Search,
  X,
  MapPin,
  Mail,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useTrainers, useCandidates, useBatches, useSessions, useCreateBatch } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AIDraftBatchCard } from "@/components/ai/AIDraftBatchCard";

const technologies = [
  "Java Full Stack",
  "Cloud Native (AWS)",
  "Salesforce Admin & Dev",
  "ServiceNow ITSM",
  "Data Engineering (Databricks)",
  "Cybersecurity Fundamentals",
  "Mainframe Modernization",
  "GenAI Foundations",
  "React + TypeScript",
  "DevOps & Kubernetes",
  "SAP S/4HANA",
  "Microsoft Power Platform",
];

const locations = [
  "Mumbai", "Chennai", "Pune", "Bengaluru", "Noida",
  "Hyderabad", "Krakow", "Mexico City", "Atlanta", "London",
];

interface FormState {
  name: string;
  technology: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  daysPerWeek: string;
  startHour: string;
  trainerId: string;
  candidateIds: string[];
}

const stepDefs = [
  { id: 1, label: "Basics", icon: Layers, desc: "Name, technology, location" },
  { id: 2, label: "Schedule", icon: CalendarDays, desc: "Dates and timing" },
  { id: 3, label: "Trainer", icon: GraduationCap, desc: "Assign and check conflicts" },
  { id: 4, label: "Roster", icon: Users, desc: "Add candidates" },
  { id: 5, label: "Review", icon: ClipboardCheck, desc: "Confirm and create" },
];

function defaultName(tech: string, loc: string, batchCount: number) {
  if (!tech || !loc) return "";
  const techShort = tech.split(" ")[0].toUpperCase();
  const locShort = loc.substring(0, 3).toUpperCase();
  const num = 100 + (batchCount + 1);
  return `HX-${techShort}-${locShort}-${num}`;
}

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function BatchNew() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: trainers = [] } = useTrainers();
  const { data: candidates = [] } = useCandidates();
  const { data: batches = [] } = useBatches();
  const { data: sessions = [] } = useSessions();
  const createBatch = useCreateBatch();
  const [step, setStep] = useState(1);
  const [candidateSearch, setCandidateSearch] = useState("");
  const nameAutoRef = useRef(true);
  const [form, setForm] = useState<FormState>({
    name: "",
    technology: "",
    location: "",
    description: "",
    startDate: todayStr(7),
    endDate: todayStr(56),
    daysPerWeek: "5",
    startHour: "9",
    trainerId: "",
    candidateIds: [],
  });

  useEffect(() => {
    document.title = "New Batch · Maverick";
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (key === "name") nameAutoRef.current = false;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if ((key === "technology" || key === "location") && nameAutoRef.current) {
        next.name = defaultName(
          key === "technology" ? (value as string) : f.technology,
          key === "location" ? (value as string) : f.location,
          batches.length
        );
      }
      return next;
    });
  };

  const trainer = trainers.find((t) => t.id === form.trainerId);

  const trainerConflicts = useMemo(() => {
    if (!form.trainerId) return [];
    return sessions.filter((s) => s.trainerId === form.trainerId);
  }, [form.trainerId, sessions]);

  const skillMatchTrainers = useMemo(() => {
    if (!form.technology) return trainers.slice(0, 8);
    const mapped = trainers.map((t) => ({
      ...t,
      match: t.skills.includes(form.technology) ? 2 : 0,
      availability: 100 - sessions.filter((s) => s.trainerId === t.id).length * 8,
    }));
    const sorted = mapped.sort((a, b) => b.match - a.match || b.availability - a.availability);
    return sorted;
  }, [form.technology, trainers, sessions]);

  // Best match = skill-matched trainer with the highest rating
  const bestMatchId = useMemo(() => {
    const matched = skillMatchTrainers.filter(t => t.skills.includes(form.technology));
    if (!matched.length) return null;
    return matched.reduce((best, t) => t.rating > best.rating ? t : best, matched[0]!).id;
  }, [skillMatchTrainers, form.technology]);

  const filteredCandidates = useMemo(() => {
    const q = candidateSearch.toLowerCase().trim();
    const pool = candidates.filter((c) => c.status === "Active");
    if (!q) return pool.slice(0, 50);
    return pool
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [candidateSearch, candidates]);

  const selectedCandidates = useMemo(
    () => candidates.filter((c) => form.candidateIds.includes(c.id)),
    [form.candidateIds, candidates]
  );

  const stepValid = (n: number): boolean => {
    if (n === 1) return !!form.name.trim() && !!form.technology && !!form.location;
    if (n === 2) {
      return (
        !!form.startDate &&
        !!form.endDate &&
        new Date(form.endDate) > new Date(form.startDate)
      );
    }
    if (n === 3) return !!form.trainerId;
    if (n === 4) return form.candidateIds.length > 0;
    return true;
  };

  const canContinue = stepValid(step);

  const next = () => {
    if (step < 5 && canContinue) setStep(step + 1);
  };
  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = async () => {
    try {
      await createBatch.mutateAsync({
        name: form.name,
        technology: form.technology,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        trainerId: form.trainerId,
        candidateIds: form.candidateIds,
        candidateCount: form.candidateIds.length,
      });
      toast({
        title: "Batch created",
        description: `${form.name} has been added to the schedule.`,
      });
      setTimeout(() => navigate("/batches"), 300);
    } catch {
      toast({
        title: "Failed to create batch",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const durationDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const ms = new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }, [form.startDate, form.endDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 mb-1 text-muted-foreground"
          >
            <Link href="/batches">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to batches
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">New Batch</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Compose a new training batch step by step.
          </p>
        </div>
      </div>

      <AIDraftBatchCard
        onApply={(draft) => {
          setForm((f) => ({
            ...f,
            name: draft.name || f.name,
            technology: draft.technology || f.technology,
            location: draft.location || f.location,
            description: draft.description || f.description,
            startDate: draft.startDate || f.startDate,
            endDate: draft.endDate || f.endDate,
          }));
          toast({
            title: "Draft applied",
            description: "Review the steps and adjust details before publishing.",
          });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <Card className="lg:sticky lg:top-20 self-start">
          <CardContent className="p-4">
            <ol className="space-y-1">
              {stepDefs.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isComplete = step > s.id && stepValid(s.id);
                const isReachable =
                  s.id <= step ||
                  (s.id === step + 1 && stepValid(step));
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => isReachable && setStep(s.id)}
                      disabled={!isReachable}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                        isActive && "bg-primary/10",
                        !isActive && isReachable && "hover:bg-muted",
                        !isReachable && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2",
                          isComplete &&
                            "bg-primary text-primary-foreground border-primary",
                          isActive && !isComplete && "border-primary text-primary",
                          !isActive && !isComplete && "border-border text-muted-foreground"
                        )}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-primary" : "text-foreground"
                          )}
                        >
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {s.desc}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Batch basics</CardTitle>
                    <CardDescription>
                      Pick a technology and primary delivery location. The name
                      auto-fills from your selection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tech">Technology track</Label>
                        <Select
                          value={form.technology}
                          onValueChange={(v) => update("technology", v)}
                        >
                          <SelectTrigger id="tech">
                            <SelectValue placeholder="Select a track" />
                          </SelectTrigger>
                          <SelectContent>
                            {technologies.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select
                          value={form.location}
                          onValueChange={(v) => update("location", v)}
                        >
                          <SelectTrigger id="location">
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchName">Batch name</Label>
                      <Input
                        id="batchName"
                        placeholder="HX-JAVA-MUM-136"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Convention: HX-&lt;TRACK&gt;-&lt;CITY&gt;-&lt;NUMBER&gt;
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description (optional)</Label>
                      <Textarea
                        id="desc"
                        rows={3}
                        placeholder="Cohort focus, sponsors, expected outcomes..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>
                      Set the calendar window and weekly cadence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Start date</Label>
                        <Input
                          id="start"
                          type="date"
                          value={form.startDate}
                          onChange={(e) => update("startDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">End date</Label>
                        <Input
                          id="end"
                          type="date"
                          value={form.endDate}
                          onChange={(e) => update("endDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Days per week</Label>
                        <Select
                          value={form.daysPerWeek}
                          onValueChange={(v) => update("daysPerWeek", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["3", "4", "5", "6"].map((d) => (
                              <SelectItem key={d} value={d}>
                                {d} days / week
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Daily start time</Label>
                        <Select
                          value={form.startHour}
                          onValueChange={(v) => update("startHour", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[8, 9, 10, 11, 13, 14].map((h) => (
                              <SelectItem key={h} value={String(h)}>
                                {h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Stat label="Duration" value={`${durationDays} days`} />
                      <Stat
                        label="Approx weeks"
                        value={`${Math.max(1, Math.round(durationDays / 7))}`}
                      />
                      <Stat label="Sessions / wk" value={form.daysPerWeek} />
                      <Stat
                        label="Total sessions"
                        value={`~${Math.round(
                          (durationDays / 7) * Number(form.daysPerWeek)
                        )}`}
                      />
                    </div>

                    {form.startDate &&
                      form.endDate &&
                      new Date(form.endDate) <= new Date(form.startDate) && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/30 rounded-md p-3">
                          <AlertTriangle className="h-4 w-4" />
                          End date must be after the start date.
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assign trainer</CardTitle>
                    <CardDescription>
                      Trainers matching the {form.technology || "selected"} track
                      are highlighted. We'll flag any active calendar conflicts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
                    {skillMatchTrainers.map((t) => {
                      const isSelected = form.trainerId === t.id;
                      const isMatch = t.skills.includes(form.technology);
                      const conflictCount = sessions.filter(
                        (s) => s.trainerId === t.id
                      ).length;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => update("trainerId", t.id)}
                          className={cn(
                            "w-full text-left flex items-center gap-3 p-3 rounded-lg border-2 transition-colors hover-elevate",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card"
                          )}
                        >
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={t.avatar} />
                            <AvatarFallback>
                              {t.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">
                                {t.name}
                              </span>
                              {isMatch && (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Skill match
                                </Badge>
                              )}
                              {t.id === bestMatchId && (
                                <Badge className="bg-primary/15 text-primary border-primary/30">
                                  <Star className="h-3 w-3 mr-1 fill-primary" />
                                  Best match
                                </Badge>
                              )}
                              {t.utilization > 90 && (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                                  Heavy load
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.title} · {t.location} · {t.utilization}% utilized
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{t.rating}</span>
                          </div>
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </CardContent>
                  {trainer && (
                    <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                      {trainerConflicts.length > 0 ? (
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-amber-700 dark:text-amber-300">
                              {trainer.name} has {trainerConflicts.length} existing weekly session
                              {trainerConflicts.length === 1 ? "" : "s"}.
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              Adding this batch may cause overlaps. Review the schedule before publishing.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-emerald-700 dark:text-emerald-300">
                              No scheduling conflicts detected.
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {trainer.name} is free across the planned cadence.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add candidates</CardTitle>
                    <CardDescription>
                      Pick candidates from the active pool. You can also bulk-import
                      from CSV.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search candidates by name or email"
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button variant="outline" disabled className="shrink-0">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        {filteredCandidates.length} matching ·{" "}
                        <span className="text-foreground font-medium">
                          {form.candidateIds.length} selected
                        </span>
                      </div>
                      {form.candidateIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => update("candidateIds", [])}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <div className="border border-border rounded-md max-h-[400px] overflow-y-auto divide-y divide-border">
                      {filteredCandidates.map((c) => {
                        const checked = form.candidateIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={cn(
                              "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50",
                              checked && "bg-primary/5"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                if (v) {
                                  update("candidateIds", [...form.candidateIds, c.id]);
                                } else {
                                  update(
                                    "candidateIds",
                                    form.candidateIds.filter((id) => id !== c.id)
                                  );
                                }
                              }}
                            />
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={c.avatar} />
                              <AvatarFallback>
                                {c.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {c.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {c.email}
                              </div>
                            </div>
                            <Badge variant="outline" className="shrink-0 hidden sm:inline-flex">
                              {c.performance}% perf
                            </Badge>
                          </label>
                        );
                      })}
                      {filteredCandidates.length === 0 && (
                        <div className="p-6 text-sm text-muted-foreground text-center">
                          No candidates match your search.
                        </div>
                      )}
                    </div>

                    {selectedCandidates.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Selected
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidates.map((c) => (
                            <Badge
                              key={c.id}
                              className="bg-primary/10 text-primary border-primary/30 pl-2 pr-1 py-1"
                            >
                              {c.name}
                              <button
                                type="button"
                                aria-label={`Remove ${c.name}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  update(
                                    "candidateIds",
                                    form.candidateIds.filter((id) => id !== c.id)
                                  );
                                }}
                                className="ml-1.5 hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review & create</CardTitle>
                    <CardDescription>
                      Confirm the details below. You can still go back to make changes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ReviewSection title="Basics" onEdit={() => setStep(1)}>
                      <ReviewRow label="Batch name" value={form.name} />
                      <ReviewRow label="Technology" value={form.technology} />
                      <ReviewRow
                        label="Location"
                        value={
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {form.location}
                          </span>
                        }
                      />
                      {form.description && (
                        <DescriptionReviewRow description={form.description} />
                      )}
                    </ReviewSection>

                    <ReviewSection title="Schedule" onEdit={() => setStep(2)}>
                      <ReviewRow
                        label="Window"
                        value={`${form.startDate} → ${form.endDate} (${durationDays} days)`}
                      />
                      <ReviewRow
                        label="Cadence"
                        value={`${form.daysPerWeek} days/week, starting ${
                          Number(form.startHour) > 12
                            ? `${Number(form.startHour) - 12}:00 PM`
                            : `${form.startHour}:00 AM`
                        }`}
                      />
                    </ReviewSection>

                    <ReviewSection title="Trainer" onEdit={() => setStep(3)}>
                      {trainer ? (
                        <div className="flex items-center gap-3 pt-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={trainer.avatar} />
                            <AvatarFallback>
                              {trainer.name.split(" ").map((p) => p[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm">{trainer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {trainer.title}
                            </div>
                          </div>
                          {trainerConflicts.length > 0 && (
                            <Badge className="ml-auto bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {trainerConflicts.length} potential conflicts
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No trainer assigned.
                        </div>
                      )}
                    </ReviewSection>

                    <ReviewSection title="Roster" onEdit={() => setStep(4)}>
                      <ReviewRow
                        label="Candidates"
                        value={`${form.candidateIds.length} selected`}
                      />
                      {selectedCandidates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {selectedCandidates.slice(0, 12).map((c) => (
                            <Badge
                              key={c.id}
                              variant="outline"
                              className="font-normal"
                            >
                              {c.name}
                            </Badge>
                          ))}
                          {selectedCandidates.length > 12 && (
                            <Badge variant="outline" className="font-normal">
                              +{selectedCandidates.length - 12} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </ReviewSection>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 1}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="text-xs text-muted-foreground text-center order-first sm:order-none">
              Step {step} of {stepDefs.length}
            </div>
            {step < 5 ? (
              <Button
                onClick={next}
                disabled={!canContinue}
                className="w-full sm:w-auto"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={createBatch.isPending}
                className="w-full sm:w-auto"
              >
                {createBatch.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Creating…</>
                ) : (
                  <><Check className="h-4 w-4 mr-1" />Create batch</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-3 bg-muted/30">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold font-mono mt-0.5">{value}</div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 text-xs"
        >
          Edit
        </Button>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function DescriptionReviewRow({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-muted-foreground text-xs uppercase tracking-wider shrink-0">
          Description
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs shrink-0"
          onClick={() => setOpen(true)}
        >
          Show
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose aria-describedby={undefined} className="max-w-lg flex flex-col max-h-[75vh] p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border shrink-0">
            <DialogTitle className="text-sm font-semibold flex-1">Description</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewRow({
  label,
  value,
  stack,
}: {
  label: string;
  value: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 min-w-0",
        stack ? "flex-col" : "items-center justify-between"
      )}
    >
      <span className="text-muted-foreground text-xs uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="font-medium text-sm break-words min-w-0 overflow-hidden">{value}</span>
    </div>
  );
}
