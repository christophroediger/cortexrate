import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth-cookies";
import { env } from "@/lib/env";

const recoverySessionRequestSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional().nullable()
});

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedBody = recoverySessionRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid recovery session request.");
    }

    const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${parsedBody.data.access_token}`
      },
      cache: "no-store"
    });

    if (!userResponse.ok) {
      throw new ApiError(401, "UNAUTHORIZED", "Your reset link is no longer valid.");
    }

    const nextResponse = NextResponse.json({
      data: {
        ok: true
      }
    });

    setAuthCookies(nextResponse, {
      access_token: parsedBody.data.access_token,
      refresh_token: parsedBody.data.refresh_token
    });

    return nextResponse;
  } catch (error) {
    return errorFromUnknown(error);
  }
}
