## 1. Setup

- [x] 1.1 Add `cheerio` and `@google/genai` to `package.json` dependencies
- [x] 1.2 Add `GEMINI_API_KEY` to `.env.local` (and document it in README/`.env.example` if one exists)
- [x] 1.3 Ensure the `liked_posts_summaries` table exists in Supabase with `id`, `url`, `summary`, `created_at` (no `tone` column) — confirmed via live schema introspection
- [x] 1.4 Update `supabase/migrations/20260815000000_create_linkedin_post_summaries.sql` to match the live table shape (drop the `tone` column) so the migration file stays a faithful record of the schema

## 2. URL validation

- [x] 2.1 Implement a helper that validates a string is a syntactically well-formed LinkedIn post URL
- [x] 2.2 Return a client error (400) response when the URL is missing or invalid, without fetching

## 3. Scraping and extraction

- [x] 3.1 Implement a fetch helper that retrieves the raw HTML for a given URL
- [x] 3.2 Implement `extractPostText(html): string | null` using `cheerio` to pull the post body text, returning `null` when no recognizable post content is found (e.g. login wall)
- [x] 3.3 Return a distinct error response when content cannot be retrieved or extracted, without calling the LLM or writing to the database

## 4. Summarization

- [x] 4.1 Update the Gemini response schema and prompt in `utils/linkedin/analyze.ts` to drop `tone` entirely and raise the summary limit from 3 to 5 sentences
- [x] 4.2 Update response validation to check only the `summary` field (drop the tone array checks); return an error response if validation fails

## 5. Persistence

- [x] 5.1 Update the Supabase insert in `utils/linkedin/persist.ts` to write only `{ url, summary }` — the live table no longer has a `tone` column, so the current insert (which still sends `tone`) will fail
- [x] 5.2 Return an error response if the insert fails, distinguishing it from upstream (fetch/LLM) failures

## 6. API route

- [x] 6.1 Wire together validation → fetch/extract → summarize → persist → response in `app/api/summarize-post/route.ts`
- [x] 6.2 Update the success response to `{ summary }` only (drop `tone`)
- [x] 6.3 Ensure each failure mode (invalid URL, scrape failure, LLM failure, persistence failure) returns a distinct, descriptive error response per the spec scenarios

## 7. Verification

- [x] 7.1 Manually re-test the route end-to-end after the tone removal: confirm a successful run returns only `{ summary }` and the insert succeeds against the live table
- [x] 7.2 Confirm the saved row in `liked_posts_summaries` has the expected `url` and `summary`, with no `tone` value written
