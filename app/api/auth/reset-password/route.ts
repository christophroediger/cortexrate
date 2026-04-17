import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { env, getAppUrl, getSupabasePublicAuthKey } from "@/lib/env";
import { logWarn } from "@/lib/observability";

const resetPasswordRequestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const publicAuthKey = getSupabasePublicAuthKey();

    if (!env.SUPABASE_URL || !publicAuthKey) {
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
        apikey: publicAuthKey
      },
      body: JSON.stringify({
        email: parsedBody.data.email,
        redirect_to: updatePasswordRedirectUrl,
        redirectTo: updatePasswordRedirectUrl
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      logWarn("reset_password_email_failed", {
        status: response.status
      });
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
