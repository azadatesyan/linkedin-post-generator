## Context

Next.js App Router API route (`app/api/*`), Supabase (`@supabase/ssr` / `@supabase/supabase-js`) as the database, no existing scraping or LLM integration in the codebase. See proposal.md for motivation and the chosen scraping/LLM tradeoffs.

## Goals / Non-Goals

**Goals:**

- Single request/response API route that goes from URL to stored summary, then returning summary.
- Keep the scraping, extraction, LLM, and persistence steps as separate functions so any one of them can be swapped later (e.g. plain fetch → third-party scraping API) without touching the others.

**Non-Goals:**

- Handling LinkedIn authentication, cookies, or any login-gated content.
- Retrying or queuing failed scrapes; this is a synchronous best-effort fetch.
- Deduplicating or updating existing records for a URL that was already summarized — every successful request inserts a new row.

## Decisions

- **Scraping: plain `fetch` + `cheerio` HTML parsing**, not a headless browser or third-party API. Rationale: no new external service/cost, keeps the route simple and self-contained. Trade-off accepted per proposal.md: LinkedIn's login wall will block many real posts, and this route will return a clear "content could not be retrieved" error in that case rather than silently succeeding with empty content. Alternatives considered: Playwright (heavier runtime, still detectable), Apify/Proxycurl (reliable but adds a paid dependency) — deferred to a future iteration if this proves insufficient.
- **Text extraction**: use `cheerio` to select LinkedIn's post-body markup by known CSS selectors/attributes (e.g. text within the article/post container), stripping scripts/styles. Because LinkedIn's markup changes without notice, extraction is isolated in one function (`extractPostText(html): string | null`) that returns `null` when nothing recognizable is found, which the route treats as scrape failure.
- **LLM: Gemini API** via `@google/genai`, using `gemini-3.5-flash-lite` (a free-tier model) with `responseSchema`/`responseMimeType: "application/json"` so summary comes back as structured JSON.
- **Persistence: new Supabase table `liked_posts_summaries`** with columns `id` (uuid, pk), `url` (text), `summary` (text), `created_at` (timestamptz, default now()).
- **Route shape**: `POST /api/summarize-post` with JSON body `{ url: string }`, using the existing `utils/supabase/server.ts` client pattern for the DB write.

## Risks / Trade-offs

- [LinkedIn blocks the unauthenticated fetch (login wall / bot detection)] → Extraction returns `null`, route responds with a distinct "content could not be retrieved" error instead of persisting empty/garbage data. This is expected to happen often; documented as a known limitation, not treated as a bug.
- [LinkedIn markup changes break the CSS selectors used for extraction] → Extraction is isolated in a single function so selectors can be updated without touching fetch/LLM/persistence logic.
- [LLM returns malformed JSON or more/fewer than 5 sentences] → Route validates the parsed LLM output (summary ≤ 5 sentences is best-effort/not hard-enforced by code, but required fields are validated) and responds with an error if validation fails, rather than persisting bad data.
- [No dedup] → Repeated requests for the same URL create multiple rows; acceptable for this iteration since there's no read/list API yet.

## Open Questions

- None — scraping method and LLM provider were confirmed with the user (plain HTTP fetch + HTML parse; Gemini API, free-tier model).
