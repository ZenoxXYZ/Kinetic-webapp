import { z } from "zod";

import { ERROR_CODES, error, success } from "@/lib/api/response";
import { createOTPChallenge } from "@/lib/auth/otp";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  phone: z
    .string()
    .regex(/^01\d{9}$/, "Phone must be an 11-digit Bangladeshi number starting with 01"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logger.warn("api.auth.otp.request", "Invalid JSON body");
    return error("Invalid JSON body", ERROR_CODES.VALIDATION_ERROR, 400);
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("api.auth.otp.request", "Validation failed", {
      issues: parsed.error.issues,
    });

    return error(
      parsed.error.issues[0]?.message ?? "Invalid request body",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }

  const { phone } = parsed.data;
  const limit = rateLimit(`otp-request:${phone}`, 3, 10 * 60);

  if (!limit.success) {
    logger.warn("api.auth.otp.request", "Rate limit exceeded", {
      phone,
      resetAt: limit.resetAt,
    });

    return error(
      "Too many OTP requests. Please try again later.",
      ERROR_CODES.RATE_LIMITED,
      429,
    );
  }

  try {
    const result = await createOTPChallenge(phone);

    if (!result.success) {
      logger.warn("api.auth.otp.request", "OTP challenge creation failed", {
        phone,
        reason: result.error,
      });

      if (result.error === "OTP_COOLDOWN") {
        return error(
          "Please wait before requesting another OTP.",
          ERROR_CODES.RATE_LIMITED,
          429,
        );
      }

      if (result.error === "SMS_DELIVERY_FAILED") {
        return error(
          "Could not send OTP. Please try again.",
          ERROR_CODES.INTERNAL_ERROR,
          502,
        );
      }

      return error("Could not create OTP challenge.", ERROR_CODES.INTERNAL_ERROR, 500);
    }

    logger.info("api.auth.otp.request", "OTP challenge created", {
      phone,
      expiresAt: result.expiresAt,
    });

    return success({
      expiresAt: result.expiresAt,
    });
  } catch (cause) {
    logger.error("api.auth.otp.request", "Unexpected OTP request error", {
      cause,
      phone,
    });

    return error("Unexpected OTP request error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
