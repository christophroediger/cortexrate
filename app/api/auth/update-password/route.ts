import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

const updatePasswordRequestSchema = z.object({
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

    if (!accessToken) {
      throw new ApiError(401, "UNAUTHORIZED", "Open the password reset link from your email to continue.");
    }

    const requestBody = await request.json();
    const parsedBody = updatePasswordRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid password update request.");
    }

    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        password: parsedBody.data.password
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new ApiError(400, "BAD_REQUEST", "We couldn't update your password.");
    }

    return NextResponse.json({
      data: {
        ok: true
      }
    });
  } catch (error) {
    return errorFromUnknown(error);
  }
}
