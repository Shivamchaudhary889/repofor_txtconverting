import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2, Lightbulb, X } from "lucide-react";
import { useGenerateQuestions, GQ_STORAGE_KEY, type GeneratedQuestions } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { AIMarkdown } from "./AIMarkdown";
import { consumePendingDeepLink, registerOpenAISource } from "@/lib/ai-events";
import { useAIDeepLinkOpener } from "@/components/ai/ai-notifications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function loadLastResult(): GeneratedQuestions | null {
  try {
    const raw = localStorage.getItem(GQ_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeneratedQuestions) : null;
  } catch {
    return null;
  }
}

export function GenerateQuestionsDialog() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("Spring Boot REST APIs");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [count, setCount] = useState(5);
  const gen = useGenerateQuestions();
  // Reload from storage each time the dialog opens so freshly-completed
  // results (that arrived while the dialog was closed) are shown immediately.
  const [lastResult, setLastResult] = useState<GeneratedQuestions | null>(loadLastResult);

  const handleOpen = (next: boolean) => {
    if (next) setLastResult(loadLastResult());
    setOpen(next);
  };

  // When the user clicks a notification that navigated here, consume the
  // pending deep-link and auto-open the dialog.
  useEffect(() => {
    if (consumePendingDeepLink("generate-questions")) {
      setLastResult(loadLastResult());
      setOpen(true);
    }
  }, []);

  // When already on the Assessments page and the user clicks a notification,
  // the event fires immediately (no navigation needed) — handle that here.
  useAIDeepLinkOpener("generate-questions", () => {
    setLastResult(loadLastResult());
    setOpen(true);
  });

  // While the dialog is open, suppress notifications for this source so
  // toasts and chimes don't fire while the user is already watching.
  useEffect(() => {
    if (!open) return;
    return registerOpenAISource("generate-questions");
  }, [open]);

  const displayData = gen.data ?? lastResult;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="ai-button">
          <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent
        hideClose
        className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden ai-card"
      >
        {/* Non-scrolling header with X always visible */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogHeader className="flex-1 min-w-0 space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <span className="ai-icon">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="ai-gradient-text font-semibold">
                Generate assessment questions
              </span>
            </DialogTitle>
            <DialogDescription>
              MaveAI will draft 4-option multiple-choice questions you can edit
              before publishing.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 mt-0.5"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <Label>Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Count</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                You can close this dialog — you'll be notified when questions
                are ready.
              </p>
              <Button
                className="ai-button shrink-0"
                onClick={() => {
                  setLastResult(null);
                  gen.reset();
                  gen.mutate({ topic, difficulty, count });
                }}
                disabled={gen.isPending || !topic.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" /> Generate
              </Button>
            </div>
          </div>

          {gen.isPending && <AILoadingDots label="Drafting questions" />}
          {gen.error && <AIErrorState error={gen.error} />}
          {!gen.isPending && lastResult && !gen.data && (
            <p className="text-xs text-muted-foreground italic">
              Showing your last generated set — click Generate to create a new one.
            </p>
          )}
          {displayData && (
            <div className="space-y-4">
              {displayData.questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border p-4 bg-card space-y-3"
                >
                  <div className="text-sm font-semibold space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">
                      Question {i + 1}
                    </div>
                    <div className="font-semibold">
                      <QuestionMarkdown>{q.question}</QuestionMarkdown>
                    </div>
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      {q.options.map((o, j) => {
                        const isAnswer =
                          typeof q.answer === "string" &&
                          q.answer.trim() === o.trim();
                        return (
                          <div
                            key={j}
                            className={`flex items-start gap-2 text-sm rounded-md border px-3 py-2 ${
                              isAnswer
                                ? "border-emerald-500/40 bg-emerald-500/5"
                                : "border-border/60 bg-background"
                            }`}
                          >
                            <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0 w-5">
                              {String.fromCharCode(65 + j)}.
                            </span>
                            <span className="flex-1 break-words">{o}</span>
                            {isAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answer
                    </div>
                    <div className="text-sm">
                      <InlineMarkdown>{q.answer}</InlineMarkdown>
                    </div>
                  </div>

                  <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-1">
                      <Lightbulb className="h-3.5 w-3.5" /> Explanation
                    </div>
                    <div className="text-sm">
                      <InlineMarkdown>{q.explanation}</InlineMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InlineMarkdown({ children }: { children: string }) {
  return <AIMarkdown>{children}</AIMarkdown>;
}

function QuestionMarkdown({ children }: { children: string }) {
  return <AIMarkdown>{children}</AIMarkdown>;
}
