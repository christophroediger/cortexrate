import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default(""),
  SUPABASE_URL: z.string().trim().optional().default(""),
  SUPABASE_ANON_KEY: z.string().trim().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().optional().default(""),
  DEV_AUTH_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  DEV_AUTH_USER_ID: z.string().trim().optional().default("dev-user-1"),
  DEV_AUTH_USER_EMAIL: z.string().email().optional().default("dev@example.com"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DEV_AUTH_ENABLED: process.env.DEV_AUTH_ENABLED,
  DEV_AUTH_USER_ID: process.env.DEV_AUTH_USER_ID,
  DEV_AUTH_USER_EMAIL: process.env.DEV_AUTH_USER_EMAIL,
  NODE_ENV: process.env.NODE_ENV
});

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getConfigHealth() {
  return {
    appUrlConfigured: Boolean(env.NEXT_PUBLIC_APP_URL),
    supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    devAuthEnabled: env.DEV_AUTH_ENABLED
  };
}
