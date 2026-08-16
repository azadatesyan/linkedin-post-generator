import { createClient } from "@supabase/supabase-js";

const MAX_LIKED_POSTS = 50;

export interface LikedPostContext {
  summary: string;
}

export async function fetchLikedPostContext(): Promise<{
  context: LikedPostContext[];
  error: string | null;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await supabase
    .from("liked_posts_summaries")
    .select("summary")
    .order("created_at", { ascending: false })
    .limit(MAX_LIKED_POSTS);

  if (error) {
    return { context: [], error: error.message };
  }

  return { context: data ?? [], error: null };
}
