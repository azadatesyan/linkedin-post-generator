## Context

Next.js App Router, `app/page.tsx` is currently an async Server Component that reads Supabase directly. Supabase access already has two established patterns in this codebase: the SSR client in `utils/supabase/server.ts` (cookie-bound), and the `@supabase/supabase-js` `createClient(url, key)` form with `SUPABASE_SECRET_KEY` (used by `utils/linkedin/persist.ts` and this capability's own helpers). Gemini access is already established in `utils/linkedin/analyze.ts` (`@google/genai`, `GEMINI_API_KEY`, model `gemini-3.5-flash-lite`). See proposal.md for motivation and the `suggestions`-table persistence decision.

Two source tables feed generation: `liked_posts_summaries` (`id`, `url`, `summary`, `created_at` — it does **not** have a `tone` column; that column was dropped from the live table by the sibling `add-linkedin-post-summarizer` change) and `personal_posts` (`id`, `original_url`, `content`, `created_at` — the user's own past post text, confirmed via live schema introspection). The existing `fetchLikedPostContext` helper still selects `summary, tone` and will error against the live table; fixing that is part of this change's rework, not a regression introduced by it.

## Goals / Non-Goals

**Goals:**
- A single button on the home page that: reads all `liked_posts_summaries` rows (topics) and the user's `personal_posts` rows (tone/style, when available) → asks the LLM for one French, engagement-oriented post → saves it to `suggestions` → displays it, with a distinct error state for each failure point (no liked posts, generation failure, save failure). Personal posts are optional context, not a failure point.
- Reuse the existing Gemini client/model pattern rather than introducing a second LLM integration style.

**Non-Goals:**
- Editing or regenerating a previously generated post; each click produces one new independent post.
- Any UI for browsing past `suggestions` rows, or for browsing/managing `personal_posts` — this change only reads `personal_posts` as context.
- Multi-user scoping: this app has no auth today, so "the user's liked posts" and "the user's personal posts" mean all rows in the respective tables.

## Decisions

- **Route shape**: a new `POST /api/generate-post` route handler (no request body needed) that does the read → LLM → write and returns `{ post: string }` on success. Mirrors the existing `/api/summarize-post` route's shape (validate/gather → LLM → persist → respond with distinct errors).
- **Client interaction**: `app/page.tsx` is currently a Server Component; the button needs client-side interactivity (click → fetch → loading/result state), so a small Client Component (`components/GeneratePostButton.tsx`) is added and rendered from `page.tsx`. The existing todos list stays a Server Component; only the new button is client-side.
- **LLM**: reuse `@google/genai` with the same model already in use for summarization (`gemini-3.5-flash-lite`) for consistency and to stay on the free tier. The prompt builder combines two context sources: liked-post summaries (topics to draw on) and personal-post content (style/voice examples to imitate). When there are no personal posts, the prompt falls back to a generic "engaging, professional freelance-software-engineer" tone instruction instead of style examples. Output is plain French prose (no structured-output schema needed — validated only as "non-empty").
- **Context size**: `liked_posts_summaries` capped at the most recent 50 rows (`summary` only, ordered by `created_at desc`) as before. `personal_posts` is full post text rather than a summary, so it's capped more conservatively at the most recent 10 rows (`content`, ordered by `created_at desc`) to keep the prompt bounded while still giving the LLM enough voice signal.
- **Persistence to `suggestions`**: unchanged — inserts `{ content }`, confirmed against the live table schema (`id`, `created_at`, `content`).
- **Supabase client for the new route**: the `@supabase/supabase-js` `createClient(url, key)` form with `SUPABASE_SECRET_KEY`, for both `liked_posts_summaries`/`personal_posts` reads and the `suggestions` write, consistent with the sibling capability.

## Risks / Trade-offs

- [Existing `liked_posts_summaries` read still selects the now-dropped `tone` column] → Fixed as part of this change: the helper is updated to select only `summary`.
- [`personal_posts` content is long-form, full post text, not a summary] → Capped at the most recent 10 rows (vs. 50 for liked-post summaries) to bound prompt size while still giving useful style signal.
- [LLM produces English or mixed-language output despite the French instruction] → Not validated in code (free-form prose isn't practical to strictly validate); treated as a prompt-quality concern rather than a hard failure — the response is still shown if non-empty.
- [No dedup] → Repeated requests create multiple `suggestions` rows; acceptable for this iteration since there's no read/list API yet.

## Open Questions

- None — sourcing behavior (liked posts mandatory, personal posts optional context) was confirmed with the user.
