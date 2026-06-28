import { GoogleGenAI, type Content } from "@google/genai";
import { logger } from "./logger";

const baseURL = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"] || undefined;
const apiKey =
  process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] ||
  process.env["GEMINI_API_KEY"];

export const isAIConfigured = Boolean(apiKey);

export const aiClient = apiKey
  ? new GoogleGenAI({
      apiKey,
      ...(baseURL
        ? { httpOptions: { apiVersion: "", baseUrl: baseURL } }
        : {}),
    })
  : null;

export const AI_MODEL = process.env["AI_MODEL"] || "gemini-2.5-flash";

export const AI_NOT_CONFIGURED_MESSAGE =
  "AI features are not configured. Set GEMINI_API_KEY in your environment (and restart the API server) to enable them.";

if (!isAIConfigured) {
  logger.warn(
    "GEMINI_API_KEY (or AI_INTEGRATIONS_GEMINI_API_KEY) is not set — AI endpoints will return a friendly error.",
  );
}

export interface AIChatOptions {
  system?: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
}

export async function aiComplete(opts: AIChatOptions): Promise<string> {
  if (!aiClient) throw new AIUnavailableError();

  const response = await aiClient.models.generateContent({
    model: AI_MODEL,
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    config: {
      ...(opts.system ? { systemInstruction: opts.system } : {}),
      maxOutputTokens: opts.maxTokens ?? 8192,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  });

  return response.text ?? "";
}

export async function aiCompleteJSON<T>(opts: AIChatOptions): Promise<T> {
  const content = await aiComplete({ ...opts, json: true });
  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("AI returned non-JSON response");
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function aiChat(
  messages: ChatMessage[],
  maxTokens = 8192,
): Promise<string> {
  if (!aiClient) throw new AIUnavailableError();

  const systemMsgs = messages.filter((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMsgs.map((m) => m.content).join("\n\n");

  const contents: Content[] = chatMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await aiClient.models.generateContent({
    model: AI_MODEL,
    contents,
    config: {
      ...(systemInstruction ? { systemInstruction } : {}),
      maxOutputTokens: maxTokens,
    },
  });

  return response.text ?? "";
}

export class AIUnavailableError extends Error {
  status = 503 as const;
  constructor() {
    super(AI_NOT_CONFIGURED_MESSAGE);
    this.name = "AIUnavailableError";
  }
}
