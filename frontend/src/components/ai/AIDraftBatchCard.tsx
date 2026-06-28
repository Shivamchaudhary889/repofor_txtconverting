import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2 } from "lucide-react";
import { useDraftBatch, type DraftBatchResult } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { Badge } from "@/components/ui/badge";

const DRAFT_KEY = "maveai.draft-batch.last-result";

function loadLastDraft(): DraftBatchResult | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftBatchResult) : null;
  } catch {
    return null;
  }
}

export function AIDraftBatchCard({
  onApply,
}: {
  onApply?: (draft: DraftBatchResult) => void;
}) {
  const [prompt, setPrompt] = useState(
    "4-week React + TypeScript batch for 25 freshers in Chennai, intermediate difficulty",
  );
  const draft = useDraftBatch();
  const [lastDraft, setLastDraft] = useState<DraftBatchResult | null>(loadLastDraft);

  useEffect(() => {
    if (!draft.data) return;
    setLastDraft(draft.data);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft.data));
    } catch { /* storage full */ }
  }, [draft.data]);

  const displayData = draft.data ?? lastDraft;

  return (
    <Card className="ai-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="ai-icon"><Sparkles className="h-3.5 w-3.5" /></span>
          <span className="ai-gradient-text font-semibold">AI batch designer</span>
        </CardTitle>
        <CardDescription>
          Describe the batch you want and Maverick will draft a curriculum, suggested
          assessments, and a starting configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 6-week Java Full Stack batch for 30 candidates in Mumbai"
        />
        <div className="flex justify-end">
          <Button
            className="ai-button"
            onClick={() => {
              setLastDraft(null);
              draft.reset();
              draft.mutate(prompt);
            }}
            disabled={draft.isPending || !prompt.trim()}
          >
            <Wand2 className="h-4 w-4 mr-2" /> Draft batch
          </Button>
        </div>

        {draft.isPending && <AILoadingDots label="Designing your batch" />}
        {draft.error && <AIErrorState error={draft.error} />}
        {!draft.isPending && lastDraft && !draft.data && (
          <p className="text-xs text-muted-foreground italic">
            Showing your last batch draft — click "Draft batch" to generate a new one.
          </p>
        )}
        {displayData && (
          <div className="rounded-md border border-primary/30 bg-card p-4 space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-base">{displayData.name}</span>
              <Badge variant="outline">{displayData.technology}</Badge>
              <Badge variant="outline">{displayData.location}</Badge>
              <Badge variant="outline">{displayData.durationWeeks} weeks</Badge>
              <Badge variant="outline">{displayData.candidateCount} candidates</Badge>
            </div>
            <div>
              <div className="font-medium mb-2">Curriculum outline</div>
              <ul className="space-y-2">
                {displayData.curriculumOutline.map((w) => (
                  <li key={w.week} className="border-l-2 border-primary/40 pl-3">
                    <div className="font-medium">Week {w.week} — {w.topic}</div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                      {w.outcomes.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Suggested assessments</div>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                {displayData.suggestedAssessments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
            {onApply && (
              <div className="flex justify-end">
                <Button size="sm" onClick={() => onApply(displayData)}>
                  Apply to form
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
