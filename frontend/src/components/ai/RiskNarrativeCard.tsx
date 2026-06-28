import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Sparkles, Target } from "lucide-react";
import { useRiskNarrative } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { AIMarkdown } from "./AIMarkdown";

export function RiskNarrativeCard({ candidateId }: { candidateId: string }) {
  const { data, isLoading, error } = useRiskNarrative(candidateId);

  return (
    <Card className="ai-card-warn">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="ai-icon" style={{ background: "linear-gradient(135deg, hsl(38 92% 60%), hsl(20 92% 60%))", boxShadow: "0 4px 14px -4px hsl(38 92% 60% / 0.55)" }}><Sparkles className="h-3.5 w-3.5" /></span>
          <span className="font-semibold" style={{ background: "linear-gradient(90deg, hsl(38 92% 50%), hsl(20 92% 55%))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>AI risk analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading && <AILoadingDots label="Analyzing this candidate" />}
        {error && <AIErrorState error={error} />}
        {data && (
          <>
            <AIMarkdown>{data.summary}</AIMarkdown>
            <div className="rounded-md bg-background/40 p-3 border border-amber-500/20">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="h-3.5 w-3.5" /> Risk drivers
              </div>
              <ul className="space-y-1.5">
                {data.drivers.map((d, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2 items-start">
                    <span className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-amber-500" />
                    <span className="flex-1">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-background/40 p-3 border border-primary/20">
              <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Target className="h-3.5 w-3.5" /> Recommended actions
              </div>
              <ul className="space-y-1.5">
                {data.recommendedActions.map((d, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2 items-start">
                    <span
                      className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: "linear-gradient(135deg, hsl(258 90% 66%), hsl(190 95% 55%))" }}
                    />
                    <span className="flex-1">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
