const CORTEX_CLOUD_ORIGIN = "https://cloud.neuraldsp.com";

export function getExtensionCorsHeaders(methods: string[]) {
  return {
    "Access-Control-Allow-Origin": CORTEX_CLOUD_ORIGIN,
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

export function withCors(response: Response, methods: string[]) {
  const headers = getExtensionCorsHeaders(methods);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
