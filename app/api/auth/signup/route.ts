import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth-cookies";
import { env } from "@/lib/env";

const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirect_to: z.string().optional()
});

type SupabaseSignupResponse = {
  access_token?: string;
  refresh_token?: string | null;
  user?: {
    id: string;
    email?: string | null;
  } | null;
};

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedBody = signupRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid sign-up request.");
    }

    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
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
      throw new ApiError(400, "BAD_REQUEST", "Sign-up could not be completed.");
    }

    const authBody = (await response.json()) as SupabaseSignupResponse;
    const nextResponse = NextResponse.json({
      data: authBody.access_token
        ? {
            status: "authenticated",
            redirect_to: parsedBody.data.redirect_to || "/"
          }
        : {
            status: "confirmation_required",
            redirect_to: "/login"
          }
    });

    if (authBody.access_token) {
      setAuthCookies(nextResponse, {
        access_token: authBody.access_token,
        refresh_token: authBody.refresh_token
      });
    }

    return nextResponse;
  } catch (error) {
    return errorFromUnknown(error);
  }
}
