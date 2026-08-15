import { createClient } from "@supabase/supabase-js";
import type { PostAnalysis } from "@/utils/linkedin/analyze";

export async function persistPostAnalysis(
  url: string,
  analysis: PostAnalysis,
): Promise<{ error: string | null }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { error } = await supabase.from("liked_posts_summaries").insert({
    url,
    summary: analysis.summary,
  });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
