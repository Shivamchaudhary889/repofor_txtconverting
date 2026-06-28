import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { useAIBriefing } from "@/hooks/use-ai";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { AIMarkdown } from "./AIMarkdown";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function AIBriefingCard() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error, isFetching, refetch } = useAIBriefing();
  const qc = useQueryClient();
  const refreshing = isFetching && !isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        className="ai-trigger w-full sm:w-auto justify-between h-11 px-4 gap-3"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2.5">
          <span className="ai-icon h-7 w-7 p-1.5">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="ai-gradient-text font-semibold text-sm">
            Today's AI Briefing
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
              Generating…
            </span>
          ) : error ? (
            <span className="text-destructive">Unavailable</span>
          ) : (
            <span>Click to view</span>
          )}
        </span>
      </Button>
      <DialogContent hideClose className="max-w-2xl ai-card flex flex-col max-h-[85vh] p-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Today's AI Briefing</DialogTitle>
          <DialogDescription>
            Executive summary generated from today's live training operations snapshot.
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Fixed header — never scrolls */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
          <span className="ai-icon h-7 w-7 p-1.5 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold ai-gradient-text">Today's AI Briefing</div>
            <div className="text-xs text-muted-foreground">Executive summary from today's live operations snapshot.</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={isFetching}
            onClick={() => {
              qc.removeQueries({ queryKey: ["ai-briefing"] });
              void refetch();
            }}
            aria-label="Refresh briefing"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto sidebar-scroll p-4">
          {(isLoading || refreshing) && (
            <AILoadingDots
              label={refreshing ? "Refreshing briefing" : "Generating briefing"}
            />
          )}
          {error && !refreshing && <AIErrorState error={error} />}
          {data?.briefing && !refreshing && <AIMarkdown>{data.briefing}</AIMarkdown>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
