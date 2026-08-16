import { createClient } from "@supabase/supabase-js";

const MAX_PERSONAL_POSTS = 10;

export interface PersonalPostContext {
  content: string;
}

export async function fetchPersonalPostContext(): Promise<{
  context: PersonalPostContext[];
  error: string | null;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await supabase
    .from("personal_posts")
    .select("content")
    .order("created_at", { ascending: false })
    .limit(MAX_PERSONAL_POSTS);

  if (error) {
    return { context: [], error: error.message };
  }

  return { context: data ?? [], error: null };
}
