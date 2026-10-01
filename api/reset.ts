import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/reset
 *
 * Vercel serverless functions are stateless, so conversation history is kept
 * on the client and sent with each /api/chat request. This endpoint exists to
 * preserve API parity with the original Flask version and is effectively a
 * no-op success signal the frontend calls when clearing the chat.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({ status: "success", message: "Conversation reset" });
}