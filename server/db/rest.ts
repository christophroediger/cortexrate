import "server-only";

import { ApiError } from "@/lib/api-error";
import { logError } from "@/lib/observability";
import { getRequiredSupabaseServerConfig, getSupabaseServerHeaders } from "@/server/supabase-server";

const REST_SCHEMA = "public";

export async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  return supabaseRestWithSchema<T>(REST_SCHEMA, path, init);
}

export async function supabaseRestWithSchema<T>(
  schema: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const { supabaseUrl } = getRequiredSupabaseServerConfig();

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: getSupabaseServerHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      "Accept-Profile": schema,
      "Content-Profile": schema,
      ...(init?.headers ?? {})
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const failureText = await response.text();

    logError("supabase_rest_request_failed", {
      schema,
      path,
      status: response.status,
      responseText: failureText
    });

    throw new ApiError(500, "DATABASE_ERROR", "A database error occurred.");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
