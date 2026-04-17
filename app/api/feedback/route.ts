import { z } from "zod";

import { ApiError, isApiError } from "@/lib/api-error";
import { created, errorResponse } from "@/lib/api-response";
import { requireAuthContext } from "@/lib/auth";
import { logHandledRouteError } from "@/lib/observability";
import { storeFeedback } from "@/server/services/feedback-create";

const createFeedbackRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  pageUrl: z.string().trim().max(2048).nullable().optional()
});

export async function POST(request: Request) {
  try {
    const authContext = await requireAuthContext();
    const requestBody = await request.json();
    const parsedBody = createFeedbackRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid feedback request.");
    }

    const feedback = await storeFeedback({
      message: parsedBody.data.message,
      rating: parsedBody.data.rating ?? null,
      pageUrl: parsedBody.data.pageUrl ?? null,
      userId: authContext.userId
    });

    return created({
      id: feedback.id,
      created_at: feedback.created_at
    });
  } catch (error) {
    logHandledRouteError("feedback_submit_failed", error);

    if (isApiError(error)) {
      if (error.status === 400 || error.status === 401) {
        return errorResponse(error.status, error.code, error.message);
      }

      return errorResponse(500, "FEEDBACK_ERROR", "Feedback could not be sent.");
    }

    return errorResponse(500, "FEEDBACK_ERROR", "Feedback could not be sent.");
  }
}
