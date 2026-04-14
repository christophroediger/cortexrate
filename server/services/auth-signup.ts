import "server-only";

import { ApiError } from "@/lib/api-error";
import { env, getAppUrl } from "@/lib/env";
import { findAuthAdminUserByEmail } from "@/server/repositories/auth-admin-users";

type SupabaseSignupResponse = {
  access_token?: string;
  refresh_token?: string | null;
  user?: {
    id: string;
    email?: string | null;
  } | null;
};

export type SignupResult =
  | {
      status: "authenticated";
      redirectTo: string;
      accessToken: string;
      refreshToken?: string | null;
    }
  | {
      status: "confirmation_required" | "confirmation_resent";
      redirectTo: string;
    };

function getEmailRedirectTo() {
  return new URL("/login?message=account-confirmed", getAppUrl()).toString();
}

type SupabaseAuthErrorResponse = {
  msg?: string;
  message?: string;
  error_description?: string;
  error?: string;
};

async function parseAuthError(response: Response) {
  const responseText = await response.text();

  try {
    const parsed = JSON.parse(responseText) as SupabaseAuthErrorResponse;
    return (
      parsed.msg ||
      parsed.message ||
      parsed.error_description ||
      parsed.error ||
      responseText ||
      "Unknown Supabase auth error."
    );
  } catch {
    return responseText || "Unknown Supabase auth error.";
  }
}

function isExistingUserError(message: string) {
  return /user already registered/i.test(message);
}

function isConfirmedAccountError(message: string) {
  return /\balready confirmed\b/i.test(message) || /\bconfirmed\b/i.test(message);
}

async function resendConfirmationEmail(email: string) {
  const emailRedirectTo = getEmailRedirectTo();
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      type: "signup",
      email,
      email_redirect_to: emailRedirectTo,
      redirect_to: emailRedirectTo,
      options: {
        emailRedirectTo: emailRedirectTo,
        email_redirect_to: emailRedirectTo
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const failureMessage = await parseAuthError(response);

    if (isConfirmedAccountError(failureMessage)) {
      throw new ApiError(
        409,
        "CONFLICT",
        "An account with this email already exists. Please log in."
      );
    }

    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Your account exists but we couldn't resend the confirmation email. Please try again later."
    );
  }
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  redirectTo?: string
): Promise<SignupResult> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new ApiError(500, "CONFIG_ERROR", "Supabase authentication is not configured.");
  }

  const emailRedirectTo = getEmailRedirectTo();
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email,
      password,
      email_redirect_to: emailRedirectTo,
      redirect_to: emailRedirectTo,
      options: {
        emailRedirectTo: emailRedirectTo,
        email_redirect_to: emailRedirectTo
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const failureMessage = await parseAuthError(response);

    if (isExistingUserError(failureMessage)) {
      await resendConfirmationEmail(email);

      return {
        status: "confirmation_resent",
        redirectTo: "/login"
      };
    }

    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Sign-up could not be completed. Please try again."
    );
  }

  const authBody = (await response.json()) as SupabaseSignupResponse;

  if (authBody.access_token) {
    return {
      status: "authenticated",
      redirectTo: redirectTo || "/",
      accessToken: authBody.access_token,
      refreshToken: authBody.refresh_token
    };
  }

  const existingUser = await findAuthAdminUserByEmail(email);

  if (existingUser?.emailConfirmedAt) {
    throw new ApiError(
      409,
      "CONFLICT",
      "An account with this email already exists. Please log in."
    );
  }

  if (existingUser && !existingUser.emailConfirmedAt) {
    await resendConfirmationEmail(email);

    return {
      status: "confirmation_resent",
      redirectTo: "/login"
    };
  }

  return {
    status: "confirmation_required",
    redirectTo: "/login"
  };
}
