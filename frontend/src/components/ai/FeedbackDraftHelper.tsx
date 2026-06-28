import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2 } from "lucide-react";
import { useFeedbackDraft } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";

export function FeedbackDraftHelper({
  rating,
  onApply,
}: {
  rating: number;
  onApply: (text: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const draft = useFeedbackDraft();

  return (
    <div className="ai-card space-y-3 p-3 rounded-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="ai-icon"><Sparkles className="h-3 w-3" /></span>
        <span className="ai-gradient-text font-semibold">Need help putting it into words?</span>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Quick notes (bullet points are fine)</Label>
        <Textarea
          rows={2}
          value={notes}
          placeholder="trainer good, pace fast, more labs"
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="ai-button"
          onClick={() => draft.mutate({ notes, rating })}
          disabled={draft.isPending || !notes.trim()}
        >
          <Wand2 className="h-3.5 w-3.5 mr-2" />
          Polish with AI
        </Button>
      </div>
      {draft.isPending && <AILoadingDots />}
      {draft.error && <AIErrorState error={draft.error} />}
      {draft.data && (
        <div className="rounded-md border border-border bg-card p-3 text-sm space-y-3">
          {draft.data.draft.split(/\n\n+/).map((para, i) => (
            <p key={i} className="leading-relaxed text-foreground/90">
              {para.trim()}
            </p>
          ))}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(draft.data!.draft);
              }}
            >
              Use this
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
