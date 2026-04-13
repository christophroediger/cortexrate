import { cookies, headers } from "next/headers";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

export type AuthContext = {
  userId: string;
  email: string | null;
  isDevAuth: boolean;
  source: "supabase_cookie" | "dev_fallback";
};

type SupabaseUserResponse = {
  id: string;
  email?: string | null;
};

export const AUTH_ACCESS_COOKIE = "cortexrate-access-token";
export const AUTH_REFRESH_COOKIE = "cortexrate-refresh-token";

async function getSupabaseAuthContextFromCookie(): Promise<AuthContext | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as SupabaseUserResponse;

  return {
    userId: user.id,
    email: user.email ?? null,
    isDevAuth: false,
    source: "supabase_cookie"
  };
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabaseAuthContext = await getSupabaseAuthContextFromCookie();

  if (supabaseAuthContext) {
    return supabaseAuthContext;
  }

  const requestHeaders = await headers();
  const developmentUserId = requestHeaders.get("x-dev-user-id");
  const developmentEmail = requestHeaders.get("x-dev-user-email");

  if (env.DEV_AUTH_ENABLED && env.NODE_ENV !== "production") {
    return {
      userId: developmentUserId ?? env.DEV_AUTH_USER_ID,
      email: developmentEmail ?? env.DEV_AUTH_USER_EMAIL,
      isDevAuth: true,
      source: "dev_fallback"
    };
  }

  return null;
}

export async function requireAuthContext(): Promise<AuthContext> {
  const authContext = await getAuthContext();

  if (!authContext) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required for this endpoint.");
  }

  return authContext;
}
