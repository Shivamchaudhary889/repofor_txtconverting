import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useFeedbackThemes } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const sentimentColor: Record<string, string> = {
  positive: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  mixed: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
  negative: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function FeedbackThemesCard({ batchId }: { batchId?: string }) {
  const { data, isLoading, error, isFetching, refetch } = useFeedbackThemes(batchId);
  const qc = useQueryClient();
  const isRefreshing = isFetching && !isLoading;

  return (
    <Card className="ai-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="ai-icon"><Sparkles className="h-3.5 w-3.5" /></span>
              <span className="ai-gradient-text font-semibold">AI themes & sentiment</span>
            </CardTitle>
            <CardDescription>
              Generated from open-ended candidate comments {batchId ? "for this batch" : "across all batches"}.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={isFetching}
            onClick={() => {
              qc.removeQueries({ queryKey: ["feedback-themes", batchId ?? "all"] });
              void refetch();
            }}
            aria-label="Refresh themes"
            title="Refresh AI themes"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {(isLoading || isRefreshing) && (
          <AILoadingDots label={isRefreshing ? "Refreshing themes" : "Clustering themes"} />
        )}
        {error && !isRefreshing && <AIErrorState error={error} />}
        {data && !isRefreshing && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Overall:</span>
              <Badge className={sentimentColor[data.sentiment] ?? sentimentColor.neutral}>
                {data.sentiment}
              </Badge>
            </div>
            <p className="leading-relaxed">{data.summary}</p>
            <div className="space-y-3">
              {data.themes.map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-border bg-card"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium">{t.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {t.mentions} mention{t.mentions === 1 ? "" : "s"}
                      </Badge>
                      <Badge className={sentimentColor[t.sentiment.toLowerCase()] ?? sentimentColor.neutral}>
                        {t.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"{t.sample}"</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
