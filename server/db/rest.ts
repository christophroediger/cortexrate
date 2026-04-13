import "server-only";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

const REST_SCHEMA = "public";

function getRequiredDatabaseConfig() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(
      500,
      "CONFIG_ERROR",
      "Supabase server configuration is required for this endpoint."
    );
  }

  return {
    supabaseUrl: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  return supabaseRestWithSchema<T>(REST_SCHEMA, path, init);
}

export async function supabaseRestWithSchema<T>(
  schema: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const { supabaseUrl, serviceRoleKey } = getRequiredDatabaseConfig();

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      "Accept-Profile": schema,
      "Content-Profile": schema,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const failureText = await response.text();

    throw new ApiError(
      500,
      "DATABASE_ERROR",
      `Supabase REST request failed with status ${response.status}: ${failureText}`
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
