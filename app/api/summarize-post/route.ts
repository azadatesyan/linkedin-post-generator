import {
  isValidLinkedInPostUrl,
  sanitiseUrl,
} from "@/utils/linkedin/validate-url";
import { fetchPostHtml, extractPostText } from "@/utils/linkedin/scrape";
import { analyzePost } from "@/utils/linkedin/analyze";
import { persistPostAnalysis } from "@/utils/linkedin/persist";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const url = (body as { url?: unknown } | null)?.url;

  if (!isValidLinkedInPostUrl(url)) {
    return Response.json(
      { error: "A valid LinkedIn post URL is required." },
      { status: 400 },
    );
  }

  const sanitisedUrl = sanitiseUrl(url);

  const html = await fetchPostHtml(sanitisedUrl);
  const postText = html ? extractPostText(html) : null;
  if (!postText) {
    return Response.json(
      {
        error:
          "Could not retrieve the post content. LinkedIn may have blocked the request or the post is not publicly accessible.",
      },
      { status: 502 },
    );
  }

  let analysis;
  try {
    analysis = await analyzePost(postText);
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: "Failed to analyze the post content." },
      { status: 502 },
    );
  }

  if (!analysis) {
    return Response.json(
      { error: "Failed to analyze the post content." },
      { status: 502 },
    );
  }

  const { error: persistError } = await persistPostAnalysis(
    sanitisedUrl,
    analysis,
  );
  if (persistError) {
    console.error("Supabase insert error:", persistError);
    return Response.json(
      { error: "The analysis succeeded but could not be saved." },
      { status: 500 },
    );
  }

  return Response.json({
    summary: analysis.summary,
  });
}
