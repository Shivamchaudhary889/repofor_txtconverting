import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  History,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";
import { usePractice, PRACTICE_PENDING_KEY, type PracticeQuestions } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { cn } from "@/lib/utils";
import { consumePendingDeepLink, registerOpenAISource } from "@/lib/ai-events";
import { useAIDeepLinkOpener } from "@/components/ai/ai-notifications";

interface PracticeSession {
  id: string;
  topic: string;
  createdAt: number;
  questions: PracticeQuestions["questions"];
  picks: Record<number, number>;
}

const STORAGE_KEY = "maveai.practice.sessions";

function loadSessions(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(s: PracticeSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function PracticePanel({ defaultTopic }: { defaultTopic?: string }) {
  const [open, setOpen] = useState(false);

  // Open when notification fires while already on this page.
  useAIDeepLinkOpener("practice", () => setOpen(true));

  // Open when notification navigated to this page from elsewhere — the event
  // already fired before this component mounted, so consume from sessionStorage.
  // Also open if a pending practice result arrived while the dialog was closed.
  useEffect(() => {
    const hasDeepLink = consumePendingDeepLink("practice");
    const hasPending = !!localStorage.getItem(PRACTICE_PENDING_KEY);
    if (hasDeepLink || hasPending) setOpen(true);
  }, []);

  // While the dialog is open, suppress notifications for this source so
  // toasts and chimes don't fire while the user is already watching.
  useEffect(() => {
    if (!open) return;
    return registerOpenAISource("practice");
  }, [open]);

  return (
    <Card className="ai-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="ai-icon"><Sparkles className="h-3.5 w-3.5" /></span>
          <span className="ai-gradient-text font-semibold">AI practice questions</span>
        </CardTitle>
        <CardDescription>
          Generate quick practice MCQs to test your understanding — opens in a focused
          window so it doesn't interrupt the rest of the page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ai-button">
              <Sparkles className="h-4 w-4 mr-2" /> Open MaveAI Practice
            </Button>
          </DialogTrigger>
          <PracticeDialogContent defaultTopic={defaultTopic} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

const MAX_QUESTIONS = 30;

function clampCount(raw: number): number {
  return Math.min(MAX_QUESTIONS, Math.max(1, Math.round(raw) || 1));
}

function PracticeDialogContent({ defaultTopic }: { defaultTopic?: string }) {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [topic, setTopic] = useState(defaultTopic ?? "Spring Boot REST APIs");
  const [count, setCount] = useState(3);
  const [moreCount, setMoreCount] = useState(3);
  const [search, setSearch] = useState("");
  const practice = usePractice();
  const morePractice = usePractice();

  useEffect(() => {
    const saved = loadSessions();
    // Consume any pending result that completed while the dialog was closed
    try {
      const raw = localStorage.getItem(PRACTICE_PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as {
          topic: string;
          result: PracticeQuestions;
          createdAt: number;
        };
        localStorage.removeItem(PRACTICE_PENDING_KEY);
        const id = `p-${pending.createdAt}`;
        if (!saved.find((s) => s.id === id)) {
          const session: PracticeSession = {
            id,
            topic: pending.topic,
            createdAt: pending.createdAt,
            questions: pending.result.questions,
            picks: {},
          };
          const merged = [session, ...saved];
          setSessions(merged);
          setActiveId(id);
          return;
        }
      }
    } catch { /* malformed */ }
    setSessions(saved);
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
    if (!q) return sorted;
    return sorted.filter((s) => s.topic.toLowerCase().includes(q));
  }, [sessions, search]);

  const start = () => {
    if (!topic.trim()) return;
    const safeCount = clampCount(count);
    practice.mutate(
      { topic, count: safeCount },
      {
        onSuccess: (data) => {
          const id = `p-${Date.now()}`;
          const session: PracticeSession = {
            id,
            topic,
            createdAt: Date.now(),
            questions: data.questions,
            picks: {},
          };
          setSessions((prev) => [session, ...prev]);
          setActiveId(id);
        },
      },
    );
  };

  const addMore = (session: PracticeSession) => {
    const remaining = MAX_QUESTIONS - session.questions.length;
    if (remaining <= 0) return;
    const safeMore = clampCount(Math.min(moreCount, remaining));
    morePractice.mutate(
      { topic: session.topic, count: safeMore },
      {
        onSuccess: (data) => {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === session.id
                ? { ...s, questions: [...s.questions, ...data.questions] }
                : s,
            ),
          );
        },
      },
    );
  };

  const setPick = (qIndex: number, pick: number) => {
    if (!active) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === active.id
          ? { ...s, picks: { ...s.picks, [qIndex]: pick } }
          : s,
      ),
    );
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <DialogContent hideClose className="p-0 overflow-hidden ai-card max-w-4xl w-[95vw] h-[85vh] flex flex-col">
      <div className="flex items-start gap-2 px-4 pt-4 pb-3 border-b border-border shrink-0">
        <DialogHeader className="flex-1 min-w-0 space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <span className="ai-icon"><Sparkles className="h-4 w-4" /></span>
            <span className="ai-gradient-text font-semibold">AI Practice</span>
          </DialogTitle>
          <DialogDescription>
            Quick MCQs to test your understanding. Past sessions are saved on this device.
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* History sidebar */}
        <aside className="w-60 shrink-0 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <Button
              size="sm"
              className="w-full ai-button justify-start"
              onClick={() => setActiveId(null)}
            >
              <Plus className="h-4 w-4 mr-2" /> New session
            </Button>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history…"
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto sidebar-scroll p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                {search ? "No sessions match." : "No sessions yet."}
              </div>
            ) : (
              filtered.map((s) => {
                const correct = s.questions.reduce(
                  (acc, q, i) => acc + (s.picks[i] === q.answerIndex ? 1 : 0),
                  0,
                );
                const answered = Object.keys(s.picks).length;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "group rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted text-xs",
                      activeId === s.id && "bg-muted",
                    )}
                    onClick={() => setActiveId(s.id)}
                  >
                    <div className="flex items-center gap-1">
                      <History className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate font-medium">
                        {s.topic}
                      </span>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSession(s.id);
                        }}
                        aria-label="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      <span>
                        {answered === 0
                          ? "Not started"
                          : `${correct}/${s.questions.length}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-4">
          {!active ? (
            <div className="max-w-xl mx-auto pt-8 space-y-4">
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 rounded-full ai-icon items-center justify-center mx-auto">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold ai-gradient-text">
                  New practice session
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pick a topic and how many MCQs to generate (1–{MAX_QUESTIONS}).
                  You can add more questions to any session later — up to {MAX_QUESTIONS} total.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic to practice"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={MAX_QUESTIONS}
                  value={count}
                  onChange={(e) => setCount(clampCount(Number(e.target.value)))}
                  className="w-20 text-center"
                  title={`Number of questions (1–${MAX_QUESTIONS})`}
                />
                <Button
                  className="ai-button"
                  onClick={start}
                  disabled={practice.isPending || !topic.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Generate
                </Button>
              </div>
              {practice.isPending && <AILoadingDots label="Drafting questions" />}
              {practice.error && <AIErrorState error={practice.error} />}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveId(null)}
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                </Button>
                <div className="text-sm font-semibold">{active.topic}</div>
              </div>

              {active.questions.map((q, i) => {
                const picked = active.picks[i];
                const answered = picked !== undefined;
                return (
                  <div
                    key={i}
                    className="rounded-md border border-border p-3 bg-card"
                  >
                    <div className="font-medium text-sm mb-2">
                      {i + 1}. {q.question}
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((o, j) => {
                        const isCorrect = j === q.answerIndex;
                        const isPicked = picked === j;
                        return (
                          <button
                            key={j}
                            disabled={answered}
                            onClick={() => setPick(i, j)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md border text-sm transition-colors",
                              !answered && "hover:bg-muted",
                              answered &&
                                isCorrect &&
                                "border-emerald-500/50 bg-emerald-500/10",
                              answered &&
                                isPicked &&
                                !isCorrect &&
                                "border-red-500/50 bg-red-500/10",
                              !answered && "border-border bg-card",
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              {answered && isCorrect && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              {answered && isPicked && !isCorrect && (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                              <span>
                                {String.fromCharCode(65 + j)}. {o}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {answered && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Add more questions to this session */}
              {active.questions.length < MAX_QUESTIONS && (
                <div className="rounded-md border border-dashed border-border p-4 space-y-3">
                  <div className="text-sm font-medium">
                    Add more questions
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({active.questions.length}/{MAX_QUESTIONS} used)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={MAX_QUESTIONS - active.questions.length}
                      value={moreCount}
                      onChange={(e) =>
                        setMoreCount(
                          clampCount(
                            Math.min(
                              Number(e.target.value),
                              MAX_QUESTIONS - active.questions.length,
                            ),
                          ),
                        )
                      }
                      className="w-24 text-center"
                      title={`Add 1–${MAX_QUESTIONS - active.questions.length} more questions`}
                    />
                    <Button
                      size="sm"
                      className="ai-button"
                      onClick={() => addMore(active)}
                      disabled={morePractice.isPending}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add {Math.min(moreCount, MAX_QUESTIONS - active.questions.length)} more
                    </Button>
                  </div>
                  {morePractice.isPending && <AILoadingDots label="Generating more questions" />}
                  {morePractice.error && <AIErrorState error={morePractice.error} />}
                </div>
              )}
              {active.questions.length >= MAX_QUESTIONS && (
                <p className="text-xs text-muted-foreground text-center italic">
                  Maximum {MAX_QUESTIONS} questions reached for this session.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
