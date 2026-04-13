import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { errorFromUnknown, ok } from "@/lib/api-response";
import { getCanonicalItem } from "@/server/services/item-read";

const routeParamsSchema = z.object({
  canonicalItemId: z.string().uuid()
});

type RouteContext = {
  params: Promise<{
    canonicalItemId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const parsedParams = routeParamsSchema.safeParse(params);

    if (!parsedParams.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid canonical item id.");
    }

    return ok(await getCanonicalItem(parsedParams.data.canonicalItemId));
  } catch (error) {
    return errorFromUnknown(error);
  }
}
