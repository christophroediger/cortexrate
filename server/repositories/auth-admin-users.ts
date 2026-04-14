import "server-only";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

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
