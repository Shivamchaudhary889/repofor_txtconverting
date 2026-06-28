export type Portal = "admin" | "candidate";

export type AIDeepLink = {
  href: string;
  source?: string;
  meta?: Record<string, unknown>;
};

export type AITaskStartEvent = {
  type: "start";
  id: string;
  portal: Portal;
  source: string;
  label: string;
  startedAt: number;
  deepLink?: AIDeepLink;
};

export type AITaskCompleteEvent = {
  type: "complete";
  id: string;
  portal: Portal;
  source: string;
  label: string;
  summary: string;
  finishedAt: number;
  deepLink?: AIDeepLink;
};

export type AITaskFailEvent = {
  type: "fail";
  id: string;
  portal: Portal;
  source: string;
  label: string;
  error: string;
  finishedAt: number;
  deepLink?: AIDeepLink;
};

export type AIEvent = AITaskStartEvent | AITaskCompleteEvent | AITaskFailEvent;

type Listener = (event: AIEvent) => void;
const listeners = new Set<Listener>();

export const aiEvents = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(event: AIEvent) {
    listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error("[ai-events] listener error", err);
      }
    });
  },
};

export function detectPortal(): Portal {
  if (typeof window === "undefined") return "admin";
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  let path = window.location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
  return path === "/candidate" || path.startsWith("/candidate/")
    ? "candidate"
    : "admin";
}

export function makeTaskId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Wrap a mutation function so every call emits start + (complete | fail) events.
 * The wrapped function returns the same value as the original, so React Query
 * consumers continue to work unchanged.
 */
/**
 * Module-level registry of currently-open AI dialog sources.
 * Dialogs register themselves here while they are visible so the notification
 * system can suppress redundant toasts and chimes.
 */
const _openAISources = new Set<string>();

/**
 * Register a dialog as open by its source key (e.g. "ask-maverick").
 * Returns a cleanup function that deregisters it — call on close/unmount.
 */
export function registerOpenAISource(source: string): () => void {
  _openAISources.add(source);
  return () => _openAISources.delete(source);
}

/**
 * Returns true if an AI dialog/panel for this source is currently open.
 * Used by the notification handler to skip toast + chime when the user is
 * already watching the response appear.
 */
export function isAISourceOpen(source: string): boolean {
  return _openAISources.has(source);
}

export function wrapAITask<TInput, TOutput>(
  source: string,
  config: {
    label: (input: TInput) => string;
    summary: (output: TOutput, input: TInput) => string;
    deepLink?: (input: TInput) => AIDeepLink | undefined;
  },
  fn: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput) => {
    const id = makeTaskId();
    const portal = detectPortal();
    const label = config.label(input);
    const deepLink = config.deepLink?.(input);
    aiEvents.emit({
      type: "start",
      id,
      portal,
      source,
      label,
      startedAt: Date.now(),
      deepLink,
    });
    try {
      const output = await fn(input);
      aiEvents.emit({
        type: "complete",
        id,
        portal,
        source,
        label,
        summary: config.summary(output, input),
        finishedAt: Date.now(),
        deepLink,
      });
      return output;
    } catch (err) {
      aiEvents.emit({
        type: "fail",
        id,
        portal,
        source,
        label,
        error: err instanceof Error ? err.message : String(err),
        finishedAt: Date.now(),
        deepLink,
      });
      throw err;
    }
  };
}

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = new Ctor();
  } catch {
    return null;
  }
  return audioCtx;
}

/**
 * Browsers require a user gesture before audio can play. Call this from any
 * user-initiated handler to "arm" the audio context for later programmatic
 * playback (e.g. when an AI response arrives).
 */
export function unlockAudio(): void {
  if (unlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  unlocked = true;
}

/**
 * Play a short, soft two-note chime. No-op if Web Audio is unavailable or the
 * AudioContext could not be unlocked yet.
 */
export function playChime(variant: "success" | "error" = "success"): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes =
    variant === "success"
      ? [
          { freq: 587.33, start: 0, dur: 0.18 }, // D5
          { freq: 880.0, start: 0.12, dur: 0.28 }, // A5
        ]
      : [
          { freq: 440.0, start: 0, dur: 0.16 }, // A4
          { freq: 311.13, start: 0.1, dur: 0.26 }, // Eb4
        ];

  const master = ctx.createGain();
  master.gain.value = 0.0;
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(0.18, now + 0.01);
  master.gain.linearRampToValueAtTime(0.0, now + 0.55);

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = n.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now + n.start);
    g.gain.linearRampToValueAtTime(0.6, now + n.start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur + 0.05);
  });
}

/**
 * Custom DOM event dispatched when the user clicks an AI notification deep
 * link. Components (e.g. ChatDialog wrappers) listen for their own `source`
 * to re-open the panel and focus the right thread.
 */
export const AI_DEEPLINK_EVENT = "maverick:ai-deeplink";

export function dispatchDeepLink(deepLink: AIDeepLink): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AI_DEEPLINK_EVENT, { detail: deepLink }));
}

/**
 * Pending deep-link storage — used when a notification click navigates to a
 * new route. The target page may not be mounted yet when `dispatchDeepLink`
 * fires, so we also stash the link in sessionStorage so components can pick
 * it up on mount.
 */
const PENDING_DEEPLINK_KEY = "maverick.pending-deeplink";

export function storePendingDeepLink(link: AIDeepLink): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_DEEPLINK_KEY, JSON.stringify(link));
  } catch { /* ignore */ }
}

/**
 * Consume the pending deep-link if its source matches. Returns the link and
 * clears storage, or null if nothing is pending for this source.
 */
export function consumePendingDeepLink(source: string): AIDeepLink | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_DEEPLINK_KEY);
    if (!raw) return null;
    const link = JSON.parse(raw) as AIDeepLink;
    if (link.source !== source) return null;
    sessionStorage.removeItem(PENDING_DEEPLINK_KEY);
    return link;
  } catch {
    return null;
  }
}
