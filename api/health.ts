import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MODEL_NAME, apiKeyConfigured } from "./lib/gemini.js";

/**
 * GET /api/health
 * Health check that reports whether the Gemini API key is configured.
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.status(200).json({
    status: "ok",
    api_key_configured: apiKeyConfigured,
    model: apiKeyConfigured ? MODEL_NAME : null,
  });
}