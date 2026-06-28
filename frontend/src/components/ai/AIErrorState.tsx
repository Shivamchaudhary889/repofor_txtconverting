import { AlertCircle } from "lucide-react";

export function AIErrorState({ error }: { error: unknown }) {
  const msg =
    error instanceof Error
      ? error.message
      : "AI is not available right now. Try again in a moment.";
  return (
    <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-sm">
      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-amber-900 dark:text-amber-200">{msg}</div>
    </div>
  );
}

export function AILoadingDots({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:240ms]" />
      <span className="ml-1">{label}…</span>
    </div>
  );
}
