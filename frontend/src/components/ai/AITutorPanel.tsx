import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare } from "lucide-react";
import { useTutor } from "@/hooks/use-ai";
import { ChatDialog } from "./ChatDialog";
import { useAIDeepLinkOpener } from "@/components/ai/ai-notifications";
import { consumePendingDeepLink } from "@/lib/ai-events";

const SUGGESTIONS = (topic: string) => [
  `Explain a key concept in ${topic} with a small code example.`,
  `Quiz me with 3 short questions on ${topic}.`,
  `What's a common mistake beginners make in ${topic}?`,
  `Walk me through a tiny end-to-end example using ${topic}.`,
];

export function AITutorPanel({ topic }: { topic: string }) {
  const [open, setOpen] = useState(false);
  const tutor = useTutor();

  // Open when notification is clicked while already on this page.
  useAIDeepLinkOpener("tutor", () => setOpen(true));

  // Open when notification navigated here from a different page — the event
  // already fired before this component mounted, so we use sessionStorage.
  useEffect(() => {
    if (consumePendingDeepLink("tutor")) setOpen(true);
  }, []);

  return (
    <>
      <Card className="ai-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="ai-icon"><Sparkles className="h-3.5 w-3.5" /></span>
            <span className="ai-gradient-text font-semibold">MaveAI Tutor</span>
          </CardTitle>
          <CardDescription>
            Your personal AI study coach for <span className="font-medium">{topic}</span>.
            Open a chat to ask doubts, see runnable code examples, and revisit past
            sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="ai-button w-full sm:w-auto"
            onClick={() => setOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Open MaveAI Tutor
          </Button>
          <p className="text-xs text-muted-foreground">
            Tip: your chat history is saved on this device — search past
            conversations from the sidebar.
          </p>
        </CardContent>
      </Card>

      <ChatDialog
        open={open}
        onOpenChange={setOpen}
        storageKey={`maveai.tutor.threads.${topic}`}
        title="MaveAI Tutor"
        description={`Your personal study coach for ${topic}.`}
        newChatGreeting={`Hi! I'm MaveAI Tutor for ${topic}. Ask me a concept to explain, a doubt to clear, or for a quick example.`}
        suggestions={SUGGESTIONS(topic)}
        notificationSource="tutor"
        send={async ({ message, history }) => {
          const { reply } = await tutor.mutateAsync({
            message,
            topic,
            history,
          });
          return reply;
        }}
      />
    </>
  );
}
