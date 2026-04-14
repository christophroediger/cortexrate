import { NextResponse } from "next/server";

import { env, getAppUrl } from "@/lib/env";
import { LOGIN_FLASH_COOKIE, LOGIN_FLASH_MAX_AGE_SECONDS } from "@/lib/login-flash";

function buildLoginRedirect(message: "account-confirmed" | "verification-error") {
  return new URL(`/login?message=${message}`, getAppUrl());
}

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

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
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
        apikey: env.SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type
      }),
      cache: "no-store"
    });

    if (!verifyResponse.ok) {
      return withFlashRedirect("verification-error", requestUrl);
    }

    return withFlashRedirect("account-confirmed", requestUrl);
  } catch {
    return withFlashRedirect("verification-error", requestUrl);
  }
}
