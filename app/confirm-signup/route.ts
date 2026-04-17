import { NextResponse } from "next/server";

import { env, getSupabasePublicAuthKey } from "@/lib/env";
import { LOGIN_FLASH_COOKIE, LOGIN_FLASH_MAX_AGE_SECONDS } from "@/lib/login-flash";
import { logWarn } from "@/lib/observability";

function withFlashRedirect(
  message: "account-confirmed" | "verification-error",
  requestUrl: URL
) {
  const response = NextResponse.redirect(new URL(`/login?message=${message}`, requestUrl));

  response.cookies.set(LOGIN_FLASH_COOKIE, message, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: LOGIN_FLASH_MAX_AGE_SECONDS
  });

  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const type = rawType === "signup" ? "signup" : rawType === "email" ? "email" : null;
  const publicAuthKey = getSupabasePublicAuthKey();

  if (!env.SUPABASE_URL || !publicAuthKey) {
    return withFlashRedirect("verification-error", requestUrl);
  }

  if (!tokenHash || !type) {
    return withFlashRedirect("verification-error", requestUrl);
  }

  try {
    const verifyResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publicAuthKey
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type
      }),
      cache: "no-store"
    });

    if (!verifyResponse.ok) {
      logWarn("signup_confirmation_verify_failed", {
        status: verifyResponse.status,
        type
      });
      return withFlashRedirect("verification-error", requestUrl);
    }

    return withFlashRedirect("account-confirmed", requestUrl);
  } catch {
    logWarn("signup_confirmation_request_failed", {
      type
    });
    return withFlashRedirect("verification-error", requestUrl);
  }
}
