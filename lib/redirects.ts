export function sanitizeRedirectPath(input: string | null | undefined, fallback = "/") {
  if (!input) {
    return fallback;
  }

  if (!input.startsWith("/")) {
    return fallback;
  }

  if (input.startsWith("//")) {
    return fallback;
  }

  return input;
}
