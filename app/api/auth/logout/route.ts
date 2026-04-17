import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_ACCESS_COOKIE } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { env, getSupabasePublicAuthKey } from "@/lib/env";
import { logWarn } from "@/lib/observability";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;
  const publicAuthKey = getSupabasePublicAuthKey();

  if (env.SUPABASE_URL && publicAuthKey && accessToken) {
    try {
      await fetch(`${env.SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: publicAuthKey,
          Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
      });
    } catch {
      logWarn("logout_supabase_call_failed");
      // Best-effort sign-out with cookie cleanup below.
    }
  }

  const response = NextResponse.json({
    data: {
      redirect_to: "/"
    }
  });

  clearAuthCookies(response);

  return response;
}
