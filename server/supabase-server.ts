import "server-only";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

export function getRequiredSupabaseServerConfig() {
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

export function getSupabaseServerHeaders(headers?: HeadersInit): HeadersInit {
  const { serviceRoleKey } = getRequiredSupabaseServerConfig();

  return {
    apikey: serviceRoleKey,
    ...(headers ?? {})
  };
}
