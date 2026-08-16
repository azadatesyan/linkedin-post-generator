import { GoogleGenAI } from "@google/genai";
import type { LikedPostContext } from "@/utils/generate-post/liked-posts";
import type { PersonalPostContext } from "@/utils/generate-post/personal-posts";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildPrompt(
  likedPosts: LikedPostContext[],
  personalPosts: PersonalPostContext[],
): string {
  const likedPostsList = likedPosts
    .map((post, index) => `${index + 1}. ${post.summary}`)
    .join("\n");

  const styleSection =
    personalPosts.length > 0
      ? `Here are examples of posts they have written themselves in the past. Match their tone and writing style as closely as possible:\n\n${personalPosts
          .map((post, index) => `${index + 1}. ${post.content}`)
          .join("\n\n")}`
      : "No past posts are available to match a specific writing style, so write in a generic engaging, professional tone suitable for a software engineer freelancer.";

  return `You are helping a software engineer freelancer write a new LinkedIn post in French.

Here are summaries of posts they have recently liked, which reflect the topics they gravitate toward:

${likedPostsList}

${styleSection}

Write one new, original LinkedIn post in French that:
- Is inspired by the themes of the liked posts above, without copying them.
- Reflects the author's own writing style, based on the examples above when provided.
- Is optimized to generate engagement (comments, likes, shares).
- Positions the author as an attractive software engineer freelancer to recruiters.

Respond with only the post text in French, no preamble, no explanation, no quotation marks around it.`;
}

export async function generateEngagementPost(
  likedPosts: LikedPostContext[],
  personalPosts: PersonalPostContext[],
): Promise<string | null> {
  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: buildPrompt(likedPosts, personalPosts),
  });

  const text = response.text?.trim();
  if (!text) {
    return null;
  }

  return text;
}
