import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { wrapAITask } from "@/lib/ai-events";

export type ChatMsg = { role: "user" | "assistant"; content: string };

function snippet(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "…";
}

export const useAIStatus = () =>
  useQuery({
    queryKey: ["ai-status"],
    queryFn: () => apiGet<{ configured: boolean }>("/ai/status"),
    staleTime: Infinity,
  });

export const useAIBriefing = () =>
  useQuery({
    queryKey: ["ai-briefing"],
    queryFn: () => apiGet<{ briefing: string }>("/ai/briefing"),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

export const useAskMaverick = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Ask MaveAI",
      {
        label: (input: { question: string; history?: ChatMsg[] }) =>
          input.question,
        summary: (output) => snippet(output.answer),
        deepLink: () => ({ href: "ask-maverick", source: "ask-maverick" }),
      },
      (input: { question: string; history?: ChatMsg[] }) =>
        apiPost<{ answer: string }>("/ai/ask", input),
    ),
  });

// Chat-title generation runs in the background and isn't surfaced to the user
// directly — keep it silent (no event wiring).
export const useChatTitle = () =>
  useMutation({
    mutationFn: (message: string) =>
      apiPost<{ title: string }>("/ai/chat/title", { message }),
  });

export interface RiskNarrative {
  summary: string;
  drivers: string[];
  recommendedActions: string[];
}
export const useRiskNarrative = (candidateId: string | undefined) =>
  useQuery({
    queryKey: ["risk-narrative", candidateId],
    queryFn: () =>
      apiGet<RiskNarrative>(`/ai/candidates/${candidateId}/risk-narrative`),
    enabled: !!candidateId,
    retry: false,
  });

export interface FeedbackThemes {
  summary: string;
  sentiment: "positive" | "mixed" | "negative" | "neutral";
  themes: { name: string; mentions: number; sample: string; sentiment: string }[];
}
export const useFeedbackThemes = (batchId?: string) =>
  useQuery({
    queryKey: ["feedback-themes", batchId ?? "all"],
    queryFn: () =>
      apiGet<FeedbackThemes>(
        `/ai/feedback/themes${batchId ? `?batchId=${batchId}` : ""}`,
      ),
    retry: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

export interface DraftBatchResult {
  name: string;
  technology: string;
  location: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  durationWeeks: number;
  candidateCount: number;
  curriculumOutline: { week: number; topic: string; outcomes: string[] }[];
  suggestedAssessments: string[];
}
export const useDraftBatch = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Batch Draft",
      {
        label: (prompt: string) => snippet(prompt, 80),
        summary: (output) =>
          `Drafted “${output.name}” — ${output.technology}, ${output.durationWeeks} weeks, ${output.candidateCount} candidates.`,
        deepLink: () => ({ href: "/batches/new" }),
      },
      (prompt: string) =>
        apiPost<DraftBatchResult>("/ai/batches/draft", { prompt }),
    ),
  });

export interface GeneratedQuestions {
  questions: {
    question: string;
    /** Always 4 options — every generated item is an MCQ. */
    options: string[];
    /** Plain string that matches one of the options verbatim. */
    answer: string;
    explanation: string;
  }[];
}
export const GQ_STORAGE_KEY = "maveai.generate-questions.last-result";

export const useGenerateQuestions = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Question Generator",
      {
        label: (input: { topic: string; difficulty?: string; count?: number }) =>
          `${input.topic}${input.difficulty ? ` · ${input.difficulty}` : ""}${
            input.count ? ` · ${input.count} Qs` : ""
          }`,
        summary: (output, input) =>
          `Generated ${output.questions.length} question${
            output.questions.length === 1 ? "" : "s"
          } on ${input.topic}.`,
        deepLink: () => ({ href: "/assessments", source: "generate-questions" }),
      },
      async (input: { topic: string; difficulty?: string; count?: number }) => {
        const result = await apiPost<GeneratedQuestions>("/ai/assessments/generate", input);
        try { localStorage.setItem(GQ_STORAGE_KEY, JSON.stringify(result)); } catch { /* full */ }
        return result;
      },
    ),
  });

export const useTutor = () =>
  useMutation({
    mutationFn: wrapAITask(
      "AI Tutor",
      {
        label: (input: {
          message: string;
          topic?: string;
          history?: ChatMsg[];
        }) => input.message,
        summary: (output) => snippet(output.reply),
        deepLink: () => ({ href: "/candidate/batch", source: "tutor" }),
      },
      (input: { message: string; topic?: string; history?: ChatMsg[] }) =>
        apiPost<{ reply: string }>("/ai/tutor", input),
    ),
  });

export const useCareerCoach = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Career Coach",
      {
        label: (input: {
          candidateId: string;
          message: string;
          history?: ChatMsg[];
        }) => input.message,
        summary: (output) => snippet(output.reply),
        deepLink: () => ({ href: "/candidate/", source: "career-coach" }),
      },
      (input: {
        candidateId: string;
        message: string;
        history?: ChatMsg[];
      }) => apiPost<{ reply: string }>("/ai/career-coach", input),
    ),
  });

export const useProgressNarrative = (candidateId: string | undefined) =>
  useQuery({
    queryKey: ["progress-narrative", candidateId],
    queryFn: () => apiGet<{ narrative: string }>(`/ai/candidates/${candidateId}/progress`),
    enabled: !!candidateId,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });

export interface PracticeQuestions {
  questions: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
}
/** Pending practice result saved before React lifecycle can capture it. */
export const PRACTICE_PENDING_KEY = "maveai.practice.pending-result";

export const usePractice = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Practice Questions",
      {
        label: (input: { topic: string; count?: number }) =>
          `${input.topic}${input.count ? ` · ${input.count} Qs` : ""}`,
        summary: (output, input) =>
          `Ready: ${output.questions.length} practice question${
            output.questions.length === 1 ? "" : "s"
          } on ${input.topic}.`,
        deepLink: () => ({ href: "/candidate/assessments", source: "practice" }),
      },
      async (input: { topic: string; count?: number }) => {
        const result = await apiPost<PracticeQuestions>("/ai/practice", input);
        try {
          localStorage.setItem(
            PRACTICE_PENDING_KEY,
            JSON.stringify({ topic: input.topic, result, createdAt: Date.now() }),
          );
        } catch { /* full */ }
        return result;
      },
    ),
  });

export const useFeedbackDraft = () =>
  useMutation({
    mutationFn: wrapAITask(
      "Feedback Draft",
      {
        label: (input: { notes: string; rating: number }) =>
          `${input.rating}★ — ${snippet(input.notes, 80)}`,
        summary: (output) => snippet(output.draft),
        deepLink: () => ({ href: "/feedback" }),
      },
      (input: { notes: string; rating: number }) =>
        apiPost<{ draft: string }>("/ai/feedback/draft", input),
    ),
  });
