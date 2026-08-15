export function isValidLinkedInPostUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  const host = parsed.hostname.toLowerCase();

  const isLinkedInHost =
    host === "linkedin.com" || host.endsWith(".linkedin.com");
  if (!isLinkedInHost) {
    return false;
  }

  return /^\/(posts|feed\/update)\//.test(parsed.pathname);
}

export function sanitiseUrl(url: string) {
  return url.split("?")[0];
}
