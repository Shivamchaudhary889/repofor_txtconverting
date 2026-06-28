import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAskMaverick } from "@/hooks/use-ai";
import { ChatDialog } from "./ChatDialog";
import { useAIDeepLinkOpener } from "@/components/ai/ai-notifications";

const SUGGESTED = [
  "Which batches need the most attention this week?",
  "Compare pass rate across locations.",
  "Which trainers have the lowest utilization?",
  "What should the ops lead worry about today?",
  "Show me at-risk candidates and the likely drivers.",
  "Which technology has the strongest training outcomes?",
];

export function AskMaverickDialog() {
  const [open, setOpen] = useState(false);
  const ask = useAskMaverick();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useAIDeepLinkOpener("ask-maverick", () => setOpen(true));

  return (
    <>
      <Button
        variant="outline"
        className="hidden lg:flex w-64 justify-start h-9 relative ai-trigger"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4 mr-2 text-primary shrink-0" />
        <span className="ai-gradient-text font-medium">Ask MaveAI…</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 h-6 select-none items-center gap-1 rounded border border-border bg-background/80 backdrop-blur-sm px-1.5 font-mono text-[10px] font-medium text-foreground/70 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <ChatDialog
        open={open}
        onOpenChange={setOpen}
        storageKey="maveai.ask.threads"
        title="Ask MaveAI"
        description="Your analytics co-pilot — reads your live training operations data."
        newChatGreeting="Ask anything about your training operations — I read the live data snapshot."
        suggestions={SUGGESTED}
        notificationSource="ask-maverick"
        send={async ({ message, history }) => {
          const { answer } = await ask.mutateAsync({
            question: message,
            history,
          });
          return answer;
        }}
      />
    </>
  );
}
