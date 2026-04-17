import "server-only";

import { isApiError } from "@/lib/api-error";

type LogLevel = "info" | "warn" | "error";

type SafeDetails = Record<string, unknown>;

function writeLog(level: LogLevel, event: string, details: SafeDetails = {}) {
  console[level]("CortexRate", {
    event,
    ...details
  });
}

export function logInfo(event: string, details: SafeDetails = {}) {
  writeLog("info", event, details);
}

export function logWarn(event: string, details: SafeDetails = {}) {
  writeLog("warn", event, details);
}

export function logError(event: string, details: SafeDetails = {}) {
  writeLog("error", event, details);
}

export function logHandledRouteError(event: string, error: unknown, details: SafeDetails = {}) {
  if (isApiError(error)) {
    writeLog(error.status >= 500 ? "error" : "warn", event, {
      code: error.code,
      status: error.status,
      message: error.message,
      ...details
    });
    return;
  }

  writeLog("error", event, {
    message: error instanceof Error ? error.message : "Unknown error",
    ...details
  });
}

export function logUnexpectedError(event: string, error: unknown, details: SafeDetails = {}) {
  writeLog("error", event, {
    message: error instanceof Error ? error.message : "Unknown error",
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    ...details
  });
}
