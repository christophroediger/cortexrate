import { logInfo } from "@/lib/observability";

declare global {
  var __cortexrateInstrumentationRegistered: boolean | undefined;
}

export async function register() {
  if (globalThis.__cortexrateInstrumentationRegistered) {
    return;
  }

  globalThis.__cortexrateInstrumentationRegistered = true;

  logInfo("instrumentation_registered", {
    runtime: process.env.NEXT_RUNTIME ?? "unknown"
  });
}
