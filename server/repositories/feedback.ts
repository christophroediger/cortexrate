import "server-only";

import { supabaseRest } from "@/server/db/rest";

type FeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  user_id: string | null;
  page_url: string | null;
  created_at: string;
};

type CreateFeedbackInput = {
  message: string;
  rating?: number | null;
  userId?: string | null;
  pageUrl?: string | null;
};

export async function createFeedback(input: CreateFeedbackInput): Promise<FeedbackRow> {
  const rows = await supabaseRest<FeedbackRow[]>(
    "feedback?select=id,message,rating,user_id,page_url,created_at",
    {
      method: "POST",
      body: JSON.stringify([
        {
          message: input.message,
          rating: input.rating ?? null,
          user_id: input.userId ?? null,
          page_url: input.pageUrl ?? null
        }
      ])
    }
  );

  return rows[0];
}
