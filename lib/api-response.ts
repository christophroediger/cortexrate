import { NextResponse } from "next/server";

import { isApiError } from "@/lib/api-error";

type ErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

type SuccessBody<T> = {
  data: T;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<SuccessBody<T>>({ data }, init);
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<SuccessBody<T>>({ data }, { ...init, status: 201 });
}

export function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json<ErrorBody>(
    {
      error: {
        code,
        message
      }
    },
    { status }
  );
}

export function errorFromUnknown(error: unknown) {
  if (isApiError(error)) {
    return errorResponse(error.status, error.code, error.message);
  }

  return errorResponse(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}
