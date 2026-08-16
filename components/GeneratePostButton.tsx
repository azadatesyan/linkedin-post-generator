"use client";

import { useState } from "react";

export default function GeneratePostButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-post", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        setPost(null);
        return;
      }

      setPost(data.post);
    } catch {
      setError("Something went wrong.");
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate post"}
      </button>
      {error && <p role="alert">{error}</p>}
      {post && <p style={{ whiteSpace: "pre-wrap" }}>{post}</p>}
    </div>
  );
}
