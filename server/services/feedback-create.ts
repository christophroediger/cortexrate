import "server-only";

import { createFeedback } from "@/server/repositories/feedback";

type CreateFeedbackInput = {
  message: string;
  rating?: number | null;
  userId?: string | null;
  pageUrl?: string | null;
};

export async function storeFeedback(input: CreateFeedbackInput) {
  return createFeedback({
    message: input.message.trim(),
    rating: input.rating ?? null,
    userId: input.userId ?? null,
    pageUrl: input.pageUrl ?? null
  });
}
