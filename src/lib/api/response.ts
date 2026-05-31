import { NextResponse } from "next/server";

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_INVALID: "OTP_INVALID",
  OTP_MAX_ATTEMPTS: "OTP_MAX_ATTEMPTS",
  NOT_CONFIGURED: "NOT_CONFIGURED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type ApiSuccess<TData> = {
  success: true;
  data: TData;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code: ApiErrorCode;
  };
};

export function success<TData>(data: TData, status = 200) {
  return NextResponse.json<ApiSuccess<TData>>(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function error(message: string, code: ApiErrorCode, status = 500) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status },
  );
}
