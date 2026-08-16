## 1. Setup and verification

- [x] 1.1 Inspect the real `suggestions` table schema in Supabase and confirm/adjust the column names this change will write to (`content`, `created_at`)

## 2. Liked-post context

- [x] 2.1 Fix `fetchLikedPostContext` in `utils/generate-post/liked-posts.ts` to select only `summary` — the live `liked_posts_summaries` table no longer has a `tone` column (dropped by the sibling `add-linkedin-post-summarizer` change), and the current code still selects it, which errors against the live table
- [x] 2.2 Return a distinct "no liked posts yet" result when the table has zero rows, without calling the LLM

## 3. Personal-post style context

- [x] 3.1 Implement a Supabase helper that reads the most recent 10 rows (`content`) from `personal_posts`, ordered by `created_at desc`
- [x] 3.2 Treat an empty `personal_posts` result as valid, not an error — generation proceeds using only the liked-post topic context

## 4. Post generation

- [x] 4.1 Update the Gemini prompt builder to combine liked-post topics and personal-post style examples, falling back to a generic engaging/professional tone instruction when there are no personal posts
- [x] 4.2 Validate the LLM output is non-empty text; treat empty/failed responses as a generation failure

## 5. Persistence

- [x] 5.1 Implement a Supabase helper that inserts the generated post into `suggestions` using the verified column names from 1.1
- [x] 5.2 Return an error distinguishing a persistence failure from a generation failure

## 6. API route

- [x] 6.1 Update `app/api/generate-post/route.ts` to also fetch personal-post context (task 3) and pass both liked-post and personal-post context into generation
- [x] 6.2 On success, respond with `{ post: string }`
- [x] 6.3 Ensure each failure mode (no liked posts, generation failure, persistence failure) returns a distinct, descriptive error response per the spec scenarios

## 7. Home page UI

- [x] 7.1 Create a client component (`components/GeneratePostButton.tsx`) with a button that calls `POST /api/generate-post`, shows a loading state while in flight, and is disabled/no-ops if a generation is already in progress
- [x] 7.2 On success, display the returned post text on the page
- [x] 7.3 On error, display the specific error message returned by the API
- [x] 7.4 Render the component from `app/page.tsx` alongside the existing content

## 8. Verification

- [x] 8.1 Manually test the button end-to-end with at least one row in both `liked_posts_summaries` and `personal_posts`: click → loading state → generated French post displayed, reflecting the personal posts' tone → new row visible in `suggestions`
- [x] 8.2 Manually test with `liked_posts_summaries` populated and `personal_posts` empty: confirm generation still succeeds (no error) using only the liked-post topics
- [x] 8.3 Manually test the empty-state: with zero rows in `liked_posts_summaries`, confirm the button surfaces the "no liked posts yet" message and no LLM call is made
