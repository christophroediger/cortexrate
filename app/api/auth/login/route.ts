import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

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
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedBody = loginRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid sign-in request.");
    }

    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: parsedBody.data.email,
        password: parsedBody.data.password
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password.");
    }

    const authBody = (await response.json()) as SupabaseLoginResponse;
    const nextResponse = NextResponse.json({
      data: {
        redirect_to: parsedBody.data.redirect_to || "/"
      }
    });

    nextResponse.cookies.set(AUTH_ACCESS_COOKIE, authBody.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/"
    });

    if (authBody.refresh_token) {
      nextResponse.cookies.set(AUTH_REFRESH_COOKIE, authBody.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/"
      });
    }

    return nextResponse;
  } catch (error) {
    return errorFromUnknown(error);
  }
}
