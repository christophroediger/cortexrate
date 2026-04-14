import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { env, getAppUrl } from "@/lib/env";

const resetPasswordRequestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
    }

    const requestBody = await request.json();
    const parsedBody = resetPasswordRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid reset-password request.");
    }

    const updatePasswordRedirectUrl = new URL("/update-password", getAppUrl()).toString();

    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: parsedBody.data.email,
        redirect_to: updatePasswordRedirectUrl,
        redirectTo: updatePasswordRedirectUrl
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new ApiError(400, "BAD_REQUEST", "We couldn't send the reset link.");
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
