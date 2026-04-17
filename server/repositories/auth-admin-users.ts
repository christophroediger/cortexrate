import "server-only";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";
import { logError } from "@/lib/observability";

type SupabaseAdminUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
};

type SupabaseAdminListUsersResponse = {
  users?: SupabaseAdminUser[];
};

export type AuthAdminUserLookup = {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
};

function getDisplayName(user: {
  email?: string | null;
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    user_name?: string;
  } | null;
}) {
  return (
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.user_name ??
    user.email ??
    null
  );
}

export async function findAuthAdminUserByEmail(email: string): Promise<AuthAdminUserLookup | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(500, "CONFIG_ERROR", "Supabase admin authentication is not configured.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      logError("auth_admin_lookup_failed", {
        status: response.status,
        page,
        perPage
      });
      throw new ApiError(500, "AUTH_ADMIN_LOOKUP_FAILED", "We couldn't verify the account state.");
    }

    const responseBody = (await response.json()) as SupabaseAdminListUsersResponse;
    const users = responseBody.users ?? [];
    const matchedUser = users.find((user) => user.email?.toLowerCase() === normalizedEmail);

    if (matchedUser) {
      return {
        id: matchedUser.id,
        email: matchedUser.email ?? null,
        emailConfirmedAt: matchedUser.email_confirmed_at ?? matchedUser.confirmed_at ?? null
      };
    }

    if (users.length < perPage) {
      break;
    }
  }

  return null;
}

export async function listAuthAdminUsersByIds(userIds: string[]): Promise<Map<string, string | null>> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(500, "CONFIG_ERROR", "Supabase admin authentication is not configured.");
  }

  const remainingIds = new Set(userIds);
  const displayNames = new Map<string, string | null>();
  const perPage = 1000;

  for (let page = 1; page <= 10 && remainingIds.size > 0; page += 1) {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      logError("auth_admin_list_users_failed", {
        status: response.status,
        page,
        perPage
      });
      throw new ApiError(500, "AUTH_ADMIN_LOOKUP_FAILED", "We couldn't resolve review authors.");
    }

    const responseBody = (await response.json()) as {
      users?: Array<{
        id: string;
        email?: string | null;
        user_metadata?: {
          display_name?: string;
          full_name?: string;
          user_name?: string;
        } | null;
      }>;
    };

    const users = responseBody.users ?? [];

    for (const user of users) {
      if (!remainingIds.has(user.id)) {
        continue;
      }

      displayNames.set(user.id, getDisplayName(user));
      remainingIds.delete(user.id);
    }

    if (users.length < perPage) {
      break;
    }
  }

  for (const userId of remainingIds) {
    displayNames.set(userId, null);
  }

  return displayNames;
}
