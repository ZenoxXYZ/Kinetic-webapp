import { UserRole } from "@prisma/client";
import { z } from "zod";

import { ERROR_CODES, error, success } from "@/lib/api/response";
import { setSessionCookie, signToken } from "@/lib/auth/session";
import { verifyOTPChallenge } from "@/lib/auth/otp";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const verifySchema = z.object({
  phone: z
    .string()
    .regex(/^01\d{9}$/, "Phone must be an 11-digit Bangladeshi number starting with 01"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

const otpErrorStatus = {
  OTP_INVALID: 400,
  OTP_EXPIRED: 410,
  OTP_MAX_ATTEMPTS: 429,
} as const;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logger.warn("api.auth.otp.verify", "Invalid JSON body");
    return error("Invalid JSON body", ERROR_CODES.VALIDATION_ERROR, 400);
  }

  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("api.auth.otp.verify", "Validation failed", {
      issues: parsed.error.issues,
    });

    return error(
      parsed.error.issues[0]?.message ?? "Invalid request body",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }

  const { phone, otp } = parsed.data;
  const limit = rateLimit(`otp-verify:${phone}`, 10, 15 * 60);

  if (!limit.success) {
    logger.warn("api.auth.otp.verify", "Rate limit exceeded", {
      phone,
      resetAt: limit.resetAt,
    });

    return error(
      "Too many OTP verification attempts. Please try again later.",
      ERROR_CODES.RATE_LIMITED,
      429,
    );
  }

  try {
    const verification = await verifyOTPChallenge(phone, otp);

    if (!verification.success) {
      logger.warn("api.auth.otp.verify", "OTP verification failed", {
        phone,
        reason: verification.error,
      });

      return error(
        "OTP verification failed.",
        ERROR_CODES[verification.error],
        otpErrorStatus[verification.error],
      );
    }

    const user = await db.user.upsert({
      where: {
        phone,
      },
      update: {
        lastLoginAt: new Date(),
      },
      create: {
        phone,
        role: UserRole.STUDENT,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        role: true,
        name: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      role: user.role,
    });

    const response = success({
      user,
    });

    setSessionCookie(response, token);

    logger.info("api.auth.otp.verify", "OTP verified and session created", {
      phone,
      userId: user.id,
    });

    return response;
  } catch (cause) {
    logger.error("api.auth.otp.verify", "Unexpected OTP verification error", {
      cause,
      phone,
    });

    return error("Unexpected OTP verification error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
