import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth-cookies";
import { env } from "@/lib/env";

const tokenSessionRequestSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional().nullable()
});

const tokenHashSessionRequestSchema = z.object({
  token_hash: z.string().min(1),
  type: z.literal("recovery")
});

type SupabaseVerifyResponse = {
  access_token: string;
  refresh_token?: string | null;
};

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedTokenBody = tokenSessionRequestSchema.safeParse(requestBody);
    const parsedTokenHashBody = tokenHashSessionRequestSchema.safeParse(requestBody);

    if (!parsedTokenBody.success && !parsedTokenHashBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid recovery session request.");
    }

    let accessToken: string;
    let refreshToken: string | null | undefined;

    if (parsedTokenBody.success) {
      const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${parsedTokenBody.data.access_token}`
        },
        cache: "no-store"
      });

      if (!userResponse.ok) {
        throw new ApiError(401, "UNAUTHORIZED", "Your reset link is no longer valid.");
      }

      accessToken = parsedTokenBody.data.access_token;
      refreshToken = parsedTokenBody.data.refresh_token;
    } else {
      const tokenHashBody = parsedTokenHashBody.data;

      if (!tokenHashBody) {
        throw new ApiError(400, "BAD_REQUEST", "Invalid recovery session request.");
      }

      const verifyResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          token_hash: tokenHashBody.token_hash,
          type: tokenHashBody.type
        }),
        cache: "no-store"
      });

      if (!verifyResponse.ok) {
        throw new ApiError(401, "UNAUTHORIZED", "Your reset link is no longer valid.");
      }

      const verifyBody = (await verifyResponse.json()) as SupabaseVerifyResponse;

      accessToken = verifyBody.access_token;
      refreshToken = verifyBody.refresh_token;
    }

    const nextResponse = NextResponse.json({
      data: {
        ok: true
      }
    });

    setAuthCookies(nextResponse, {
      access_token: accessToken,
      refresh_token: refreshToken
    });

    return nextResponse;
  } catch (error) {
    return errorFromUnknown(error);
  }
}
