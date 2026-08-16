## Why

The app already collects summaries for LinkedIn posts the user has liked (`liked_posts_summaries`) and the user's own past posts (`personal_posts`), but neither is used for anything yet. A one-click way to turn those into a fresh, French, engagement-oriented post lets the user quickly draft content that reflects the topics they gravitate toward and sounds like something they'd actually write, positioning them as an attractive software engineer freelancer to recruiters.

## What Changes

- Add a "Generate post" button to the app's home page (`app/page.tsx`).
- On click, the app fetches all rows from Supabase `liked_posts_summaries` (for topic ideas) and the user's past posts from `personal_posts` (for tone and writing style), and sends both as context to the LLM (Gemini, consistent with the existing `linkedin-post-summarizer` capability).
- The LLM is prompted to write a new LinkedIn post **in French**, inspired by the liked-post topics, written in the user's own voice as reflected in their past posts, and optimized for engagement and for making the user attractive to recruiters as a software engineer freelancer.
- The generated post is persisted to the existing Supabase `suggestions` table.
- The generated post is displayed on the page after generation so the user can read/copy it.
- Handle and surface failure cases distinctly: no liked posts available yet (personal posts remain optional — see Impact), LLM failure, and persistence failure.

## Capabilities

### New Capabilities
- `generate-engagement-post`: on demand, turns the user's liked-post summaries (topics) and past personal posts (tone/style) into a new French, engagement-oriented LinkedIn post and saves it.

### Modified Capabilities
(none)

## Impact

- **New code**: a client-side button/component on `app/page.tsx`, a new API route (`app/api/generate-post/route.ts`), an LLM prompt-building helper, Supabase read helpers for `liked_posts_summaries` and `personal_posts`, and a Supabase write helper for `suggestions`.
- **Reused**: the existing Gemini client pattern from the `linkedin-post-summarizer` capability (`@google/genai`, `GEMINI_API_KEY`).
- **Database**: reads from the existing `liked_posts_summaries` (`summary` column — it no longer has a `tone` column) and `personal_posts` (`content` column) tables; writes to the existing `suggestions` table (`content` column).
- **Known limitations**: if `liked_posts_summaries` has no rows, there's nothing to base a post on — the button surfaces a clear "no liked posts yet" state instead of calling the LLM. `personal_posts` is optional context: if it has no rows, generation still proceeds using only the liked-post topics with a generic tone instruction.
