import { createClient } from "@supabase/supabase-js";

export async function persistSuggestion(content: string): Promise<{ error: string | null }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { error } = await supabase.from("suggestions").insert({ content });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
