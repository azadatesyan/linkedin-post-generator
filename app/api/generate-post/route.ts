import { fetchLikedPostContext } from "@/utils/generate-post/liked-posts";
import { fetchPersonalPostContext } from "@/utils/generate-post/personal-posts";
import { generateEngagementPost } from "@/utils/generate-post/generate";
import { persistSuggestion } from "@/utils/generate-post/persist-suggestion";

export async function POST() {
  const { context: likedPosts, error: likedPostsError } = await fetchLikedPostContext();
  if (likedPostsError) {
    console.error("Supabase read error:", likedPostsError);
    return Response.json(
      { error: "Could not read liked posts." },
      { status: 500 },
    );
  }

  if (likedPosts.length === 0) {
    return Response.json(
      { error: "No liked posts yet. Like some posts before generating." },
      { status: 422 },
    );
  }

  const { context: personalPosts, error: personalPostsError } = await fetchPersonalPostContext();
  if (personalPostsError) {
    console.error("Supabase read error:", personalPostsError);
    return Response.json(
      { error: "Could not read personal posts." },
      { status: 500 },
    );
  }

  let post: string | null;
  try {
    post = await generateEngagementPost(likedPosts, personalPosts);
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: "Failed to generate a post." },
      { status: 502 },
    );
  }

  if (!post) {
    return Response.json(
      { error: "Failed to generate a post." },
      { status: 502 },
    );
  }

  const { error: persistError } = await persistSuggestion(post);
  if (persistError) {
    console.error("Supabase insert error:", persistError);
    return Response.json(
      { error: "The post was generated but could not be saved." },
      { status: 500 },
    );
  }

  return Response.json({ post });
}
