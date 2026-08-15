import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A summary of the post in at most 5 sentences.",
    },
  },
  required: ["summary"],
};

export interface PostAnalysis {
  summary: string;
}

export async function analyzePost(text: string): Promise<PostAnalysis | null> {
  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `Analyze the following LinkedIn post. Respond with a summary (at most 5 sentences).\n\nPost:\n"""\n${text}\n"""`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  if (!response.text) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    return null;
  }

  const input = parsed as { summary?: unknown };
  if (typeof input.summary !== "string" || input.summary.trim().length === 0) {
    return null;
  }

  return { summary: input.summary };
}
