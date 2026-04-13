import "server-only";

import { supabaseRestWithSchema } from "@/server/db/rest";

type AuthUserRow = {
  id: string;
  email: string | null;
  email_confirmed_at: string | null;
};

export type AuthUserLookup = {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
};

export async function findAuthUserByEmail(email: string): Promise<AuthUserLookup | null> {
  const rows = await supabaseRestWithSchema<AuthUserRow[]>(
    "auth",
    `users?select=id,email,email_confirmed_at&email=eq.${encodeURIComponent(email)}&limit=1`
  );

  if (!rows.length) {
    return null;
  }

  return {
    id: rows[0].id,
    email: rows[0].email,
    emailConfirmedAt: rows[0].email_confirmed_at
  };
}
