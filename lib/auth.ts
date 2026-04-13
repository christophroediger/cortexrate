import { headers } from "next/headers";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

export type AuthContext = {
  userId: string;
  email: string | null;
  isDevAuth: boolean;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const requestHeaders = await headers();
  const developmentUserId = requestHeaders.get("x-dev-user-id");
  const developmentEmail = requestHeaders.get("x-dev-user-email");

  if (env.DEV_AUTH_ENABLED) {
    return {
      userId: developmentUserId ?? env.DEV_AUTH_USER_ID,
      email: developmentEmail ?? env.DEV_AUTH_USER_EMAIL,
      isDevAuth: true
    };
  }

  return null;
}

export async function requireAuthContext(): Promise<AuthContext> {
  const authContext = await getAuthContext();

  if (!authContext) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required for this endpoint.");
  }

  return authContext;
}
