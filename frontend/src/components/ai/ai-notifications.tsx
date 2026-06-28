import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import {
  AI_DEEPLINK_EVENT,
  AIDeepLink,
  AIEvent,
  Portal,
  aiEvents,
  detectPortal,
  dispatchDeepLink,
  isAISourceOpen,
  playChime,
  storePendingDeepLink,
  unlockAudio,
} from "@/lib/ai-events";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Sparkles,
  Loader2,
  Check,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveTask {
  id: string;
  source: string;
  label: string;
  startedAt: number;
}

export interface CompletedNotification {
  id: string;
  kind: "success" | "error";
  source: string;
  label: string;
  summary: string;
  finishedAt: number;
  read: boolean;
  deepLink?: AIDeepLink;
}

interface State {
  active: ActiveTask[];
  notifications: CompletedNotification[];
  soundEnabled: boolean;
}

interface AINotificationsContextValue {
  active: ActiveTask[];
  notifications: CompletedNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (next: boolean) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  followDeepLink: (n: CompletedNotification) => void;
}

const AINotificationsContext =
  createContext<AINotificationsContextValue | null>(null);

const STORAGE_PREFIX = "maverick.ai-notifications";
const SOUND_KEY = `${STORAGE_PREFIX}.sound`;
const MAX_NOTIFICATIONS = 30;

function storageKey(portal: Portal) {
  return `${STORAGE_PREFIX}.${portal}.v1`;
}

function loadNotifications(portal: Portal): CompletedNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(portal));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompletedNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

function saveNotifications(portal: Portal, list: CompletedNotification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(portal),
      JSON.stringify(list.slice(0, MAX_NOTIFICATIONS)),
    );
  } catch {
    // ignore quota/privacy errors
  }
}

function loadSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

/**
 * Removes all stored AI notifications for a portal. Call from logout handlers
 * so the next user does not inherit the previous user's history.
 */
export function clearAINotificationsForPortal(portal: Portal): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(portal));
  } catch {
    // ignore
  }
}

export function AINotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location, setLocation] = useLocation();
  const portal = useMemo<Portal>(() => detectPortal(), [location]);
  const portalRef = useRef(portal);
  portalRef.current = portal;
  const locationRef = useRef(location);
  locationRef.current = location;

  const [state, setState] = useState<State>(() => ({
    active: [],
    notifications: loadNotifications(portal),
    soundEnabled: loadSoundEnabled(),
  }));

  // Re-hydrate when portal changes (admin <-> candidate).
  useEffect(() => {
    setState((s) => ({
      ...s,
      active: [],
      notifications: loadNotifications(portal),
    }));
  }, [portal]);

  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const soundRef = useRef(state.soundEnabled);
  soundRef.current = state.soundEnabled;

  // Keep storage in sync with notification list
  useEffect(() => {
    saveNotifications(portal, state.notifications);
  }, [portal, state.notifications]);

  // Persist sound setting
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SOUND_KEY, state.soundEnabled ? "1" : "0");
    } catch {
      // ignore
    }
  }, [state.soundEnabled]);

  // Subscribe to module-level event bus
  useEffect(() => {
    const off = aiEvents.subscribe((event: AIEvent) => {
      if (event.portal !== portalRef.current) return;
      if (event.type === "start") {
        setState((s) => ({
          ...s,
          active: [
            ...s.active.filter((t) => t.id !== event.id),
            {
              id: event.id,
              source: event.source,
              label: event.label,
              startedAt: event.startedAt,
            },
          ],
        }));
      } else if (event.type === "complete") {
        setState((s) => {
          const next: CompletedNotification = {
            id: event.id,
            kind: "success",
            source: event.source,
            label: event.label,
            summary: event.summary,
            finishedAt: event.finishedAt,
            read: false,
            deepLink: event.deepLink,
          };
          return {
            ...s,
            active: s.active.filter((t) => t.id !== event.id),
            notifications: [next, ...s.notifications].slice(
              0,
              MAX_NOTIFICATIONS,
            ),
          };
        });
        // Suppress sound + toast only when the user is actively watching
        // the AI response appear in an open dialog. Route matching alone is
        // not enough — the user might be on the same page with the dialog
        // closed and still deserves the chime.
        const isDialogOpen =
          event.deepLink?.source && isAISourceOpen(event.deepLink.source);
        if (!isDialogOpen) {
          if (soundRef.current) playChime("success");
          toastRef.current({
            title: `${event.source} is ready`,
            description: event.summary,
          });
        }
      } else if (event.type === "fail") {
        setState((s) => {
          const next: CompletedNotification = {
            id: event.id,
            kind: "error",
            source: event.source,
            label: event.label,
            summary: event.error || "The request failed.",
            finishedAt: event.finishedAt,
            read: false,
            deepLink: event.deepLink,
          };
          return {
            ...s,
            active: s.active.filter((t) => t.id !== event.id),
            notifications: [next, ...s.notifications].slice(
              0,
              MAX_NOTIFICATIONS,
            ),
          };
        });
        // Same suppression logic — only skip chime when the dialog is open
        // and the error will appear inline right in front of the user.
        const isDialogOpenFail =
          event.deepLink?.source && isAISourceOpen(event.deepLink.source);
        if (!isDialogOpenFail) {
          if (soundRef.current) playChime("error");
          toastRef.current({
            title: `${event.source} couldn't finish`,
            description: event.error || "Something went wrong.",
            variant: "destructive",
          });
        }
      }
    });
    return off;
  }, []);

  // Arm audio on the first user gesture so the chime can play later.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const arm = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  const value = useMemo<AINotificationsContextValue>(
    () => ({
      active: state.active,
      notifications: state.notifications,
      unreadCount: state.notifications.filter((n) => !n.read).length,
      soundEnabled: state.soundEnabled,
      setSoundEnabled: (next) =>
        setState((s) => ({ ...s, soundEnabled: next })),
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      dismiss: (id) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => setState((s) => ({ ...s, notifications: [] })),
      followDeepLink: (n) => {
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((x) =>
            x.id === n.id ? { ...x, read: true } : x,
          ),
        }));
        if (n.deepLink) {
          // If href looks like a route (starts with "/"), navigate first.
          // Only persist to sessionStorage when we are actually navigating to
          // a DIFFERENT page. If the user is already on the right page the
          // DOM event (dispatchDeepLink) opens the dialog directly, and a
          // stale sessionStorage entry would cause the dialog to re-open on
          // every subsequent visit to that page.
          if (n.deepLink.href.startsWith("/")) {
            const stripSlash = (p: string) => p.replace(/\/+$/, "") || "/";
            const isSamePage =
              stripSlash(locationRef.current) ===
              stripSlash(n.deepLink.href);
            if (n.deepLink.source && !isSamePage)
              storePendingDeepLink(n.deepLink);
            setLocation(n.deepLink.href);
          }
          // Always notify any listening components in case they need to open
          // themselves (e.g. chat dialogs match by `source`).
          dispatchDeepLink(n.deepLink);
        }
      },
    }),
    [state, setLocation],
  );

  return (
    <AINotificationsContext.Provider value={value}>
      {children}
    </AINotificationsContext.Provider>
  );
}

export function useAINotifications(): AINotificationsContextValue {
  const ctx = useContext(AINotificationsContext);
  if (!ctx) {
    throw new Error(
      "useAINotifications must be used inside <AINotificationsProvider>",
    );
  }
  return ctx;
}

/**
 * Listen for deep-link events whose `source` matches `source` and invoke
 * `onOpen`. Used by chat-style wrappers (Ask MaveAI, Tutor, Career Coach) to
 * re-open themselves when the user clicks an AI notification.
 */
export function useAIDeepLinkOpener(
  source: string,
  onOpen: (link: AIDeepLink) => void,
) {
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AIDeepLink>).detail;
      if (!detail || detail.source !== source) return;
      onOpenRef.current(detail);
    };
    window.addEventListener(AI_DEEPLINK_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(AI_DEEPLINK_EVENT, handler as EventListener);
  }, [source]);
}

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function AINotificationsBell({
  className,
}: {
  className?: string;
}) {
  const {
    active,
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAllRead,
    dismiss,
    clearAll,
    followDeepLink,
  } = useAINotifications();
  const [open, setOpen] = useState(false);
  const [, forceTick] = useState(0);

  // Re-render every 30s so "Xm ago" stays fresh while the popover is open.
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => forceTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, [open]);

  const hasActivity = active.length > 0;
  const badge = unreadCount > 0 ? unreadCount : null;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && unreadCount > 0) {
          // give the user a beat to see the count, then clear the dot
          setTimeout(markAllRead, 800);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 relative", className)}
          aria-label={
            hasActivity
              ? `Notifications — ${active.length} AI task${active.length === 1 ? "" : "s"} running`
              : badge
                ? `Notifications — ${badge} unread`
                : "Notifications"
          }
        >
          {hasActivity ? (
            <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin text-primary" />
          ) : (
            <Bell className="h-[1.2rem] w-[1.2rem]" />
          )}
          {badge !== null && !hasActivity && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold leading-[18px] text-center border border-background">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
          {hasActivity && (
            <span className="absolute -top-0.5 -right-0.5 h-[10px] w-[10px] rounded-full bg-primary border border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold truncate">
              MaveAI activity
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            aria-label={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}
            title={soundEnabled ? "Sound on" : "Sound off"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
        </div>

        {hasActivity && (
          <div className="px-3 py-2 border-b border-border bg-muted/40 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              In progress
            </div>
            {active.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                <span className="font-medium shrink-0">{t.source}:</span>
                <span className="truncate text-muted-foreground" title={t.label}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 && !hasActivity && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-6 w-6 mx-auto mb-2 opacity-40" />
              No AI activity yet.
              <div className="text-xs mt-1">
                Start a chat or generate something — you'll be pinged when it's
                ready.
              </div>
            </div>
          )}
          {notifications.length === 0 && hasActivity && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Hang tight — your result will land here.
            </div>
          )}
          {notifications.map((n) => {
            const clickable = !!n.deepLink;
            return (
              <div
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors",
                  clickable && "cursor-pointer",
                  !n.read && "bg-primary/[0.04]",
                )}
                onClick={() => {
                  if (clickable) {
                    followDeepLink(n);
                    setOpen(false);
                  }
                }}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    followDeepLink(n);
                    setOpen(false);
                  }
                }}
              >
                <div
                  className={cn(
                    "mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                    n.kind === "success"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {n.kind === "success" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {n.source}
                    </span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
                      {relativeTime(n.finishedAt)}
                    </span>
                  </div>
                  <div
                    className="text-xs text-muted-foreground line-clamp-2 mt-0.5"
                    title={n.summary}
                  >
                    {n.summary}
                  </div>
                  {n.label && n.label !== n.summary && (
                    <div
                      className="text-[11px] text-muted-foreground/70 truncate mt-0.5"
                      title={n.label}
                    >
                      “{n.label}”
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-muted/30">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
