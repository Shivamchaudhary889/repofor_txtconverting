import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, MessageSquare } from "lucide-react";
import { useCareerCoach } from "@/hooks/use-ai";
import { ChatDialog } from "./ChatDialog";
import { useAIDeepLinkOpener } from "@/components/ai/ai-notifications";
import { consumePendingDeepLink } from "@/lib/ai-events";

const SUGGESTIONS = [
  "What roles inside Hexaware fit my current skills?",
  "Build me a 4-week study plan to level up.",
  "Which skills should I learn next for an SDE role?",
  "Mock interview me for a junior developer position.",
];

export function CareerCoachCard({ candidateId }: { candidateId: string }) {
  const [open, setOpen] = useState(false);
  const coach = useCareerCoach();

  // Open when notification is clicked while already on this page.
  useAIDeepLinkOpener("career-coach", () => setOpen(true));

  // Open when notification navigated here from a different page.
  useEffect(() => {
    if (consumePendingDeepLink("career-coach")) setOpen(true);
  }, []);

  return (
    <>
      <Card className="ai-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="ai-icon">
              <Compass className="h-3.5 w-3.5" />
            </span>
            <span className="ai-gradient-text font-semibold">
              MaveAI Career Coach
            </span>
          </CardTitle>
          <CardDescription>
            A candid mentor that knows your batch, performance, and assessment
            history — get tailored skill-up advice and next-role suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="ai-button w-full sm:w-auto"
            onClick={() => setOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with my coach
          </Button>
          <p className="text-xs text-muted-foreground">
            Reads your batch & performance, suggests next roles inside Hexaware,
            and drafts a study plan you can actually follow.
          </p>
        </CardContent>
      </Card>

      <ChatDialog
        open={open}
        onOpenChange={setOpen}
        storageKey={`maveai.career-coach.threads.${candidateId}`}
        title="MaveAI Career Coach"
        description="Personalised, candid career mentoring for Hexaware trainees."
        newChatGreeting="Hi! I'm your MaveAI Career Coach. I've reviewed your batch and performance — ask me about next roles, what to learn next, or how to prep for an interview."
        suggestions={SUGGESTIONS}
        headerIcon={<Compass className="h-3.5 w-3.5" />}
        notificationSource="career-coach"
        send={async ({ message, history }) => {
          const { reply } = await coach.mutateAsync({
            candidateId,
            message,
            history,
          });
          return reply;
        }}
      />
    </>
  );
}
