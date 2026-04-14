import type { NextResponse } from "next/server";

import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

export function setAuthCookies(
  response: NextResponse,
  tokens: {
    access_token: string;
    refresh_token?: string | null;
  }
) {
  response.cookies.set(AUTH_ACCESS_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/"
  });

  if (tokens.refresh_token) {
    response.cookies.set(AUTH_REFRESH_COOKIE, tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/"
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });

  response.cookies.set(AUTH_REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}
