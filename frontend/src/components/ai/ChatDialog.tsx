import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { registerOpenAISource } from "@/lib/ai-events";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Bot,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIMarkdown } from "./AIMarkdown";
import { AIErrorState, AILoadingDots } from "./AIErrorState";
import { useChatTitle, type ChatMsg } from "@/hooks/use-ai";
import { AIOfflineBadge, useNetworkStatus } from "@/components/system/NetworkStatusIndicator";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMsg[];
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** localStorage key for persisting threads */
  storageKey: string;
  /** Title shown in the chat header */
  title: string;
  /** Subtitle shown beneath the title */
  description?: string;
  /** Suggested prompts shown for empty / brand-new chats */
  suggestions: string[];
  /** Greeting shown in a brand-new chat */
  newChatGreeting?: string;
  /** Send a message and receive the assistant reply */
  send: (input: { message: string; history: ChatMsg[] }) => Promise<string>;
  /** Optional sender label shown next to user messages */
  userLabel?: string;
  /** Optional gradient color override for the header icon */
  headerIcon?: ReactNode;
  /**
   * The deepLink source key for this dialog (e.g. "ask-maverick").
   * When provided, registers the dialog as open in the AI notification registry
   * so that toasts and chimes are suppressed while the chat is visible.
   */
  notificationSource?: string;
}

/**
 * Build a 3–5 word Title-Case title from a raw user message. Used to heal
 * legacy threads that were persisted with the literal "New chat" fallback
 * before the smart auto-titling backend was in place.
 */
function deriveTitle(msg: string): string {
  const STOP = new Set([
    "a","an","the","is","are","was","were","be","been","being","do","does","did",
    "to","of","in","on","at","for","with","and","or","but","if","then","than",
    "this","that","these","those","i","you","we","they","he","she","it","my","our",
    "your","their","his","her","its","me","us","them","what","why","how","when",
    "where","who","whom","please","can","could","should","would","may","might",
    "will","just","also","not",
  ]);
  const words = msg
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#~|]/g, " ")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const kept = words.filter((w) => !STOP.has(w.toLowerCase())).slice(0, 5);
  const titleWords = kept.length ? kept : words.slice(0, 5);
  const title = titleWords
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
  return (title || msg.slice(0, 40)).slice(0, 60);
}

function loadThreads(key: string): ChatThread[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed)) return [];

    // Heal legacy threads that were saved with the literal "New chat" title
    // before the smart auto-titling backend was in place. We re-derive the
    // title from the first user message so the user never sees "New chat"
    // sitting there forever in their sidebar.
    return parsed.map((t) => {
      const looksGeneric = !t.title || /^new\s*chat$/i.test(t.title.trim());
      if (!looksGeneric) return t;
      const firstUserMsg = t.messages?.find((m) => m.role === "user")?.content;
      if (!firstUserMsg) return t;
      return { ...t, title: deriveTitle(firstUserMsg) };
    });
  } catch {
    return [];
  }
}

function saveThreads(key: string, threads: ChatThread[]) {
  try {
    localStorage.setItem(key, JSON.stringify(threads));
  } catch {
    /* ignore */
  }
}

export function ChatDialog({
  open,
  onOpenChange,
  storageKey,
  title,
  description,
  suggestions,
  newChatGreeting,
  send,
  userLabel,
  headerIcon,
  notificationSource,
}: ChatDialogProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  // Tracks which thread (if any) currently has a pending AI request.
  // We deliberately store the thread id (not a boolean) so a stale "Thinking…"
  // loader never bleeds onto a different thread or the empty new-chat state
  // — e.g. if the user closes the dialog mid-request, reopens it, and then
  // clicks "+ New chat", the loader would otherwise sit on top of the empty
  // state forever even though the in-flight reply belongs to another thread.
  const [sendingThreadId, setSendingThreadId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Keeps a live snapshot of threads so async AI reply handlers can read the
  // current list even when the component has unmounted (dialog closed mid-request).
  const threadsRef = useRef<ChatThread[]>([]);
  const titleMutation = useChatTitle();
  const online = useNetworkStatus();

  // Register this dialog as open in the AI notification registry so that
  // toasts and chimes are suppressed while the user is actively watching.
  useEffect(() => {
    if (!notificationSource || !open) return;
    return registerOpenAISource(notificationSource);
  }, [notificationSource, open]);

  // Load on mount
  useEffect(() => {
    const loaded = loadThreads(storageKey);
    setThreads(loaded);
    setActiveId(loaded[0]?.id ?? null);
  }, [storageKey]);

  // Keep ref in sync so async callbacks can always read the latest threads.
  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // Persist on change
  useEffect(() => {
    saveThreads(storageKey, threads);
  }, [threads, storageKey]);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  const startNewChat = () => {
    setActiveId(null);
    setInput("");
    setError(null);
  };

  const removeThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const scrollToBottom = (instant?: boolean) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }, 40);
  };

  // Scroll to bottom whenever the active thread changes so the user always
  // lands at the most recent message, not the top of the conversation.
  useEffect(() => {
    if (activeId) scrollToBottom(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // True when ANY thread has a pending request — used to disable the composer
  // globally (we only allow one in-flight AI call at a time per dialog).
  const isSending = sendingThreadId !== null;
  // True only when the *currently viewed* thread is the one being awaited —
  // this is what gates the "Thinking…" loader so it stays anchored to the
  // right conversation even if the user navigates away and back.
  const showThinking = sendingThreadId !== null && sendingThreadId === activeId;

  const submit = async (text: string) => {
    const message = text.trim();
    if (!message || isSending) return;

    setError(null);
    setInput("");

    let threadId = activeId;
    let isNew = false;
    if (!threadId) {
      threadId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      isNew = true;
      const now = Date.now();
      setThreads((prev) => [
        ...prev,
        {
          id: threadId!,
          title: message.slice(0, 40),
          createdAt: now,
          updatedAt: now,
          messages: [],
        },
      ]);
      setActiveId(threadId);
    }

    // Anchor the loader to this specific thread, AFTER we know its id, so the
    // "Thinking…" indicator only ever appears next to the conversation it
    // actually belongs to.
    setSendingThreadId(threadId);

    // Push user message
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, { role: "user", content: message }],
              updatedAt: Date.now(),
            }
          : t,
      ),
    );
    scrollToBottom();

    try {
      // Read the pre-update snapshot of messages so history contains all
      // previous turns EXCLUDING the user message we just added above
      // (React batches state, so `threads` still holds the old value here).
      // The server will append `message` itself — do NOT duplicate it.
      const history =
        threads.find((t) => t.id === threadId)?.messages ?? [];
      const reply = await send({
        message,
        history,
      });

      // Build updated threads from the ref (not state) so this works even if
      // the dialog was closed (component unmounted) while the AI was thinking.
      const updatedThreads = threadsRef.current.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { role: "assistant", content: reply },
              ],
              updatedAt: Date.now(),
            }
          : t,
      );
      // Persist to localStorage immediately — independent of React lifecycle.
      saveThreads(storageKey, updatedThreads);
      // Also update React state for live UI (no-op if component is unmounted).
      setThreads(updatedThreads);
      scrollToBottom();
    } catch (err) {
      setError(err);
    } finally {
      // Clear the loader as soon as the AI reply is in (or has errored).
      // Title auto-naming below is a background task and must NOT keep the
      // "Thinking…" indicator visible after the user already has the answer.
      setSendingThreadId((cur) => (cur === threadId ? null : cur));
    }

    // Auto-name the chat from the first message — runs after the loader is
    // cleared so the user doesn't see a phantom "Thinking…" while the title
    // is being generated in the background.
    if (isNew) {
      try {
        const { title: aiTitle } = await titleMutation.mutateAsync(message);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, title: aiTitle } : t,
          ),
        );
      } catch {
        /* keep fallback title */
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="p-0 overflow-hidden ai-card max-w-5xl w-[95vw] h-[85vh] flex"
      >
        <VisuallyHidden.Root>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? ""}</DialogDescription>
        </VisuallyHidden.Root>

        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 flex flex-col border-r border-border bg-muted/20 transition-[width,opacity] overflow-hidden",
            sidebarOpen ? "w-64" : "w-0",
          )}
        >
          <div className="p-3 border-b border-border space-y-2">
            <Button
              size="sm"
              className="w-full ai-button justify-start"
              onClick={startNewChat}
            >
              <Plus className="h-4 w-4 mr-2" /> New chat
            </Button>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats…"
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto sidebar-scroll p-2 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                {search ? "No chats match." : "No chats yet."}
              </div>
            ) : (
              filteredThreads.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-muted transition-colors",
                    activeId === t.id && "bg-muted",
                  )}
                  onClick={() => setActiveId(t.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {/* min-w-0 is what actually lets `truncate` (overflow:hidden +
                      text-overflow:ellipsis) kick in inside a flex row — without
                      it, flex children default to min-width:auto and the text
                      pushes the row wider instead of clipping. The native
                      `title` attribute gives us a free browser tooltip with the
                      full chat title on hover. */}
                  <span
                    className="flex-1 min-w-0 truncate font-medium"
                    title={t.title}
                  >
                    {t.title}
                  </span>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeThread(t.id);
                    }}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-12 border-b border-border flex items-center gap-2 px-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label={sidebarOpen ? "Hide chats" : "Show chats"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
            <span className="ai-icon h-7 w-7 p-1.5">
              {headerIcon ?? <Sparkles className="h-3.5 w-3.5" />}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold truncate"
                title={active?.title ?? title}
              >
                <span className="ai-gradient-text">
                  {active?.title ?? title}
                </span>
              </div>
              {description && (
                <div
                  className="text-[11px] text-muted-foreground truncate"
                  title={description}
                >
                  {description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scroll"
          >
            {!active && (
              <div className="max-w-2xl mx-auto pt-4 space-y-5">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 rounded-full ai-icon items-center justify-center mx-auto">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold ai-gradient-text">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {newChatGreeting ?? description}
                  </p>
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground text-center">
                      Try one of these
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => submit(s)}
                          className="text-left text-xs p-3 rounded-md border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {active &&
              active.messages.map((m, i) => (
                <MessageRow key={i} msg={m} userLabel={userLabel} />
              ))}

            {showThinking && (
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full ai-icon flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <AILoadingDots />
                </div>
              </div>
            )}

            {error != null && <AIErrorState error={error} />}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-3 shrink-0 bg-background/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${title}…`}
                rows={1}
                className="resize-none min-h-[44px] max-h-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                disabled={isSending}
              />
              <Button
                type="submit"
                className="ai-button h-11 px-3"
                disabled={isSending || !input.trim() || !online}
                title={!online ? "You're offline — AI is paused" : undefined}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="text-[10px] text-muted-foreground mt-1.5 text-center flex items-center justify-center gap-2">
              <span>MaveAI can make mistakes — verify important info.</span>
              <AIOfflineBadge />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessageRow({
  msg,
  userLabel,
}: {
  msg: ChatMsg;
  userLabel?: string;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="rounded-lg bg-primary text-primary-foreground px-3 py-2 max-w-[80%] whitespace-pre-wrap text-sm">
          {msg.content}
        </div>
        <div
          className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0"
          title={userLabel}
        >
          <UserIcon className="h-4 w-4" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-full ai-icon flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-lg bg-muted px-3 py-2 max-w-[85%] min-w-0">
        <AIMarkdown>{msg.content}</AIMarkdown>
      </div>
    </div>
  );
}
