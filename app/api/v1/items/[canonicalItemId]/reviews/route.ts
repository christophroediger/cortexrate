import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown, ok } from "@/lib/api-response";
import { requireAuthContext } from "@/lib/auth";
import { getCanonicalItemReviews } from "@/server/services/review-read";
import { upsertReview } from "@/server/services/review-upsert";

const routeParamsSchema = z.object({
  canonicalItemId: z.string().uuid()
});

const upsertReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().optional()
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

type RouteContext = {
  params: Promise<{
    canonicalItemId: string;
  }>;
};

async function parseCanonicalItemId(context: RouteContext) {
  const params = await context.params;
  const parsedParams = routeParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid canonical item id.");
  }

  return parsedParams.data.canonicalItemId;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const canonicalItemId = await parseCanonicalItemId(context);

    const requestUrl = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      limit: requestUrl.searchParams.get("limit") ?? undefined,
      offset: requestUrl.searchParams.get("offset") ?? undefined
    });

    if (!parsedQuery.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid review pagination request.");
    }

    return ok(
      await getCanonicalItemReviews({
        canonicalItemId,
        limit: parsedQuery.data.limit,
        offset: parsedQuery.data.offset
      })
    );
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authContext = await requireAuthContext();
    const canonicalItemId = await parseCanonicalItemId(context);
    const requestBody = await request.json();
    const parsedBody = upsertReviewRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid review request.");
    }

    return ok(
      await upsertReview({
        canonicalItemId,
        userId: authContext.userId,
        rating: parsedBody.data.rating,
        reviewText: parsedBody.data.review_text
      })
    );
  } catch (error) {
    return errorFromUnknown(error);
  }
}
