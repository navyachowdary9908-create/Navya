import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/** Default system prompt that shapes the chatbot's behaviour. */
export const SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant.
You provide clear, accurate, and concise responses.
You can help with a wide range of topics including general knowledge, coding, writing, analysis, and more.
Always be polite and professional in your responses.`;

export const GEMINI_API_KEY: string | undefined = process.env.GEMINI_API_KEY;

export const MODEL_NAME: string =
  process.env.GEMINI_MODEL || "gemini-1.5-flash";

/** Whether a Gemini API key has been provided. */
export const apiKeyConfigured: boolean = Boolean(GEMINI_API_KEY);

let cachedModel: GenerativeModel | null = null;

/**
 * Lazily creates and caches the Gemini model instance.
 * Returns `null` when no API key is configured.
 */
export function getModel(): GenerativeModel | null {
  if (!GEMINI_API_KEY) {
    return null;
  }

  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  return cachedModel;
}