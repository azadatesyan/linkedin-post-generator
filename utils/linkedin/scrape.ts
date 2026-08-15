import * as cheerio from "cheerio";

export async function fetchPostHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkedInPostSummarizer/1.0; +https://example.com)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

const POST_TEXT_SELECTORS = [
  ".feed-shared-update-v2__description",
  ".feed-shared-text",
  "article",
];

export function extractPostText(html: string): string | null {
  const $ = cheerio.load(html);
  $("script, style").remove();

  for (const selector of POST_TEXT_SELECTORS) {
    const text = $(selector).first().text().replace(/\s+/g, " ").trim();
    if (text.length > 0) {
      return text;
    }
  }

  return null;
}
