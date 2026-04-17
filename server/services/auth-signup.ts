import "server-only";

import { ApiError } from "@/lib/api-error";
import { env, getAppUrl } from "@/lib/env";
import { logInfo, logWarn } from "@/lib/observability";
import { sanitizeRedirectPath } from "@/lib/redirects";
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
  return new URL("/confirm-signup", getAppUrl()).toString();
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
  logInfo("signup_resend_start", {
    hasRedirectTo: Boolean(emailRedirectTo)
  });
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      type: "signup",
      email,
      options: {
        emailRedirectTo: emailRedirectTo
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const failureMessage = await parseAuthError(response);
    logWarn("signup_confirmation_resend_failed", {
      status: response.status,
      reason: failureMessage
    });

    if (isConfirmedAccountError(failureMessage)) {
      throw new ApiError(
        409,
        "SIGNUP_ACCOUNT_EXISTS",
        "An account with this email already exists. Please log in."
      );
    }

    throw new ApiError(
      400,
      "SIGNUP_RESEND_FAILED",
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
    throw new ApiError(500, "SIGNUP_CONFIG_ERROR", "Supabase authentication is not configured.");
  }

  logInfo("signup_request_received", {
    hasRedirectTo: Boolean(redirectTo)
  });

  logInfo("signup_admin_lookup_start");
  const existingUser = await findAuthAdminUserByEmail(email);
  logInfo("signup_admin_lookup_complete", {
    foundUser: Boolean(existingUser),
    isConfirmed: Boolean(existingUser?.emailConfirmedAt)
  });

  if (existingUser?.emailConfirmedAt) {
    throw new ApiError(
      409,
      "SIGNUP_ACCOUNT_EXISTS",
      "An account with this email already exists. Please log in."
    );
  }

  if (existingUser && !existingUser.emailConfirmedAt) {
    logInfo("signup_unconfirmed_existing_user");
    await resendConfirmationEmail(email);

    return {
      status: "confirmation_resent",
      redirectTo: "/login"
    };
  }

  const emailRedirectTo = getEmailRedirectTo();
  logInfo("signup_fresh_attempt_start", {
    hasRedirectTo: Boolean(emailRedirectTo)
  });
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email,
      password,
      options: {
        emailRedirectTo: emailRedirectTo
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const failureMessage = await parseAuthError(response);
    logWarn("signup_failed", {
      status: response.status,
      reason: failureMessage
    });

    if (isExistingUserError(failureMessage)) {
      logInfo("signup_existing_user_branch");
      await resendConfirmationEmail(email);

      return {
        status: "confirmation_resent",
        redirectTo: "/login"
      };
    }

    throw new ApiError(
      400,
      "SIGNUP_SUPABASE_FAILED",
      "Sign-up could not be completed. Please try again."
    );
  }

  const authBody = (await response.json()) as SupabaseSignupResponse;
  logInfo("signup_supabase_success", {
    hasAccessToken: Boolean(authBody.access_token),
    hasUser: Boolean(authBody.user)
  });

  if (authBody.access_token) {
    return {
      status: "authenticated",
      redirectTo: sanitizeRedirectPath(redirectTo, "/"),
      accessToken: authBody.access_token,
      refreshToken: authBody.refresh_token
    };
  }

  return {
    status: "confirmation_required",
    redirectTo: "/login"
  };
}
