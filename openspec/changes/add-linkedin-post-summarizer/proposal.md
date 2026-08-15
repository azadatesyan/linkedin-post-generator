## Why

Reading and manually digesting LinkedIn posts to extract their key takeways is repetitive manual work. An API route that takes a post URL and returns a structured summary lets other parts of the app (or external callers) turn a raw LinkedIn post into reusable, queryable data.

## What Changes

- Add a new API route (`POST /api/summarize-post`) that accepts a LinkedIn post URL.
- Fetch the post's HTML via a direct HTTP request and parse the post text out of it.
- Send the extracted text to the Gemini API to produce a summary (max 5 sentences)
- Persist the URL and summary to a new Supabase table.
- Return the summary in the API response.
- Handle and surface failure cases distinctly: invalid/non-LinkedIn URL, fetch failure (including LinkedIn's login wall blocking unauthenticated requests), and LLM failure.

## Capabilities

### New Capabilities

- `linkedin-post-summarizer`: accepts a LinkedIn post URL, scrapes and summarizes its content, and persists the summary.

### Modified Capabilities

(none)

## Impact

- **New code**: `app/api/summarize-post/route.ts` (or similar), an HTML-scraping helper, a Gemini client helper, a Supabase persistence helper.
- **New dependency**: an HTML parser (e.g. `cheerio`) and the Gemini SDK (`@google/genai`).
- **New env var**: `GEMINI_API_KEY`.
- **Database**: new Supabase table (e.g. `liked_posts_summaries`) to store `url`, `summary` and created timestamp.
- **Known limitation**: LinkedIn frequently serves a login wall or JS-rendered shell to unauthenticated HTTP requests, so scraping via plain fetch + HTML parse (the chosen approach) will fail for many real posts. This is a deliberate, documented tradeoff — no headless browser or third-party scraping service is used in this iteration.
