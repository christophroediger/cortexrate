import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth-cookies";
import { logHandledRouteError } from "@/lib/observability";
import { signUpWithEmailPassword } from "@/server/services/auth-signup";

const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirect_to: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const parsedBody = signupRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "SIGNUP_BAD_REQUEST", "Invalid sign-up request.");
    }

    const result = await signUpWithEmailPassword(
      parsedBody.data.email,
      parsedBody.data.password,
      parsedBody.data.redirect_to
    );
    const nextResponse = NextResponse.json({
      data: {
        status: result.status,
        redirect_to: result.redirectTo
      }
    });

    if (result.status === "authenticated") {
      setAuthCookies(nextResponse, {
        access_token: result.accessToken,
        refresh_token: result.refreshToken
      });
    }

    return nextResponse;
  } catch (error) {
    logHandledRouteError("signup_route_failed", error);
    return errorFromUnknown(error);
  }
}
