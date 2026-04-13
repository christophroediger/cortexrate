import { ApiError } from "@/lib/api-error";
import { errorFromUnknown, ok } from "@/lib/api-response";
import { getConfigHealth } from "@/lib/env";

export async function GET() {
  try {
    const configHealth = getConfigHealth();
    const configStatus = configHealth.appUrlConfigured ? "ok" : "degraded";

    return ok({
      ok: true,
      service: "cortexrate",
      version: "dev",
      time: new Date().toISOString(),
      checks: {
        app: "ok",
        config: configStatus,
        database: "not_checked"
      }
    });
  } catch (error) {
    return errorFromUnknown(error);
  }
}
