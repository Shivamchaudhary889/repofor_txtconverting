import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useProgressNarrative } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { AIMarkdown } from "./AIMarkdown";

export function ProgressNarrativeCard({ candidateId }: { candidateId: string }) {
  const { data, isLoading, error } = useProgressNarrative(candidateId);

  return (
    <Card className="ai-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="ai-icon"><Sparkles className="h-3.5 w-3.5" /></span>
          <span className="ai-gradient-text font-semibold">Your weekly snapshot</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <AILoadingDots label="Personalizing" />}
        {error && <AIErrorState error={error} />}
        {data?.narrative && <AIMarkdown>{data.narrative}</AIMarkdown>}
      </CardContent>
    </Card>
  );
}
