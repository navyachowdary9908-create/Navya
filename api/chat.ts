import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getModel,
  SYSTEM_PROMPT,
  apiKeyConfigured,
  type ChatMessage,
} from "./lib/gemini.js";

/**
 * POST /api/chat
 * Sends a user message (and any conversation history) to Gemini and returns
 * the model's response.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!apiKeyConfigured) {
    res.status(500).json({
      error:
        "API key not configured. Please add your GEMINI_API_KEY environment variable on Vercel.",
    });
    return;
  }

  const model = getModel();
  if (!model) {
    res.status(500).json({
      error: "Model not initialized. Check your API key and model configuration.",
    });
    return;
  }

  try {
    const body: { message?: unknown; history?: unknown } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};

    if (typeof body.message !== "string") {
      res.status(400).json({ error: "No message provided" });
      return;
    }

    const userMessage = body.message.trim();
    if (!userMessage) {
      res.status(400).json({ error: "Empty message" });
      return;
    }

    const history = Array.isArray(body.history)
      ? (body.history as ChatMessage[])
      : [];

    // The first "user" turn carries the system prompt.
    // Subsequent turns are the conversation history (last 10 for context),
    // followed by the current user message.
    const contents = [
      { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
      ...history
        .slice(-10)
        .map((msg) => ({ role: msg.role, parts: [{ text: msg.content }] })),
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    const result = await model.generateContent({ contents });
    const botResponse = result.response.text().trim();

    res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({
      error: `An error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}