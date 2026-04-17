import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth-cookies";
import { env, getSupabasePublicAuthKey } from "@/lib/env";
import { logWarn } from "@/lib/observability";
import { sanitizeRedirectPath } from "@/lib/redirects";

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirect_to: z.string().optional()
});

type SupabaseLoginResponse = {
  access_token: string;
  refresh_token?: string;
};

export async function POST(request: Request) {
  try {
    const publicAuthKey = getSupabasePublicAuthKey();

    if (!env.SUPABASE_URL || !publicAuthKey) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedBody = loginRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid log-in request.");
    }

    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publicAuthKey
      },
      body: JSON.stringify({
        email: parsedBody.data.email,
        password: parsedBody.data.password
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      logWarn("login_failed", {
        status: response.status
      });
      throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password.");
    }

    const authBody = (await response.json()) as SupabaseLoginResponse;
    const nextResponse = NextResponse.json({
      data: {
        redirect_to: sanitizeRedirectPath(parsedBody.data.redirect_to, "/")
      }
    });

    setAuthCookies(nextResponse, authBody);

    return nextResponse;
  } catch (error) {
    return errorFromUnknown(error);
  }
}
