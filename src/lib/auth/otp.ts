import { AuditAction, OtpPurpose, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

import { appConfig } from "@/lib/config/app";
import { env } from "@/lib/config/env";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { sendOTP } from "@/lib/sms/gateway";

const OTP_HASH_ROUNDS = 12;

type CreateOTPChallengeResult =
  | {
      success: true;
      expiresAt: Date;
    }
  | {
      success: false;
      expiresAt?: Date;
      error: "OTP_COOLDOWN" | "SMS_DELIVERY_FAILED" | "INTERNAL_ERROR";
    };

type VerifyOTPChallengeResult =
  | {
      success: true;
      userId: string;
      role: UserRole;
    }
  | {
      success: false;
      error: "OTP_EXPIRED" | "OTP_INVALID" | "OTP_MAX_ATTEMPTS";
    };

const normalizePhone = (phone: string) => phone.trim();

const maskPhone = (phone: string) => {
  if (phone.length <= 4) {
    return "****";
  }

  return `${phone.slice(0, 3)}****${phone.slice(-2)}`;
};

const withPepper = (otp: string) => `${otp}:${env.OTP_PEPPER}`;

export function generateOTP() {
  const max = 10 ** appConfig.auth.otpLength;

  return randomInt(0, max)
    .toString()
    .padStart(appConfig.auth.otpLength, "0");
}

export async function hashOTP(otp: string) {
  return bcrypt.hash(withPepper(otp), OTP_HASH_ROUNDS);
}

export async function verifyOTP(otp: string, hash: string) {
  return bcrypt.compare(withPepper(otp), hash);
}

export function isExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}

export async function createOTPChallenge(
  phone: string,
): Promise<CreateOTPChallengeResult> {
  const normalizedPhone = normalizePhone(phone);
  const cooldownStart = new Date(
    Date.now() - appConfig.auth.otpCooldownSeconds * 1000,
  );

  const existingChallenge = await db.otpChallenge.findFirst({
    where: {
      phone: normalizedPhone,
      purpose: OtpPurpose.SIGN_IN,
      consumedAt: null,
      createdAt: {
        gte: cooldownStart,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingChallenge) {
    return {
      success: false,
      error: "OTP_COOLDOWN",
      expiresAt: existingChallenge.expiresAt,
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      phone: normalizedPhone,
    },
  });

  const otp = generateOTP();
  const codeHash = await hashOTP(otp);
  const expiresAt = new Date(
    Date.now() + appConfig.auth.otpExpiryMinutes * 60 * 1000,
  );

  const challenge = await db.otpChallenge.create({
    data: {
      userId: existingUser?.id,
      phone: normalizedPhone,
      purpose: OtpPurpose.SIGN_IN,
      codeHash,
      expiresAt,
    },
  });

  await db.auditLog.create({
    data: {
      userId: existingUser?.id,
      action: AuditAction.OTP_REQUESTED,
      metadata: {
        phone: maskPhone(normalizedPhone),
      },
    },
  });

  const smsResult = await sendOTP(normalizedPhone, otp);

  if (!smsResult.success) {
    await db.otpChallenge.delete({
      where: {
        id: challenge.id,
      },
    });

    await db.auditLog.create({
      data: {
        userId: existingUser?.id,
        action: AuditAction.OTP_FAILED,
        metadata: {
          reason: "SMS_DELIVERY_FAILED",
          phone: maskPhone(normalizedPhone),
        },
      },
    });

    logger.error("auth.otp", "OTP SMS delivery failed", {
      phone: maskPhone(normalizedPhone),
    });

    return {
      success: false,
      error: "SMS_DELIVERY_FAILED",
    };
  }

  return {
    success: true,
    expiresAt,
  };
}

export async function verifyOTPChallenge(
  phone: string,
  otp: string,
): Promise<VerifyOTPChallengeResult> {
  const normalizedPhone = normalizePhone(phone);
  const challenge = await db.otpChallenge.findFirst({
    where: {
      phone: normalizedPhone,
      purpose: OtpPurpose.SIGN_IN,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!challenge) {
    return {
      success: false,
      error: "OTP_INVALID",
    };
  }

  if (isExpired(challenge.expiresAt)) {
    await db.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: challenge.userId,
        action: AuditAction.OTP_FAILED,
        metadata: {
          reason: "OTP_EXPIRED",
          phone: maskPhone(normalizedPhone),
        },
      },
    });

    return {
      success: false,
      error: "OTP_EXPIRED",
    };
  }

  if (challenge.attemptCount >= appConfig.auth.maxOtpAttempts) {
    return {
      success: false,
      error: "OTP_MAX_ATTEMPTS",
    };
  }

  const isValid = await verifyOTP(otp, challenge.codeHash);

  if (!isValid) {
    const nextAttemptCount = challenge.attemptCount + 1;

    await db.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        attemptCount: {
          increment: 1,
        },
        consumedAt:
          nextAttemptCount >= appConfig.auth.maxOtpAttempts
            ? new Date()
            : undefined,
      },
    });

    await db.auditLog.create({
      data: {
        userId: challenge.userId,
        action: AuditAction.OTP_FAILED,
        metadata: {
          reason:
            nextAttemptCount >= appConfig.auth.maxOtpAttempts
              ? "OTP_MAX_ATTEMPTS"
              : "OTP_INVALID",
          attempts: nextAttemptCount,
          phone: maskPhone(normalizedPhone),
        },
      },
    });

    return {
      success: false,
      error:
        nextAttemptCount >= appConfig.auth.maxOtpAttempts
          ? "OTP_MAX_ATTEMPTS"
          : "OTP_INVALID",
    };
  }

  const user = await db.$transaction(async (transaction) => {
    const verifiedUser = await transaction.user.upsert({
      where: {
        phone: normalizedPhone,
      },
      update: {
        lastLoginAt: new Date(),
      },
      create: {
        phone: normalizedPhone,
        role: UserRole.STUDENT,
        lastLoginAt: new Date(),
      },
    });

    if (verifiedUser.role === UserRole.STUDENT) {
      await transaction.studentProfile.upsert({
        where: {
          userId: verifiedUser.id,
        },
        update: {},
        create: {
          userId: verifiedUser.id,
        },
      });
    }

    await transaction.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        userId: verifiedUser.id,
        consumedAt: new Date(),
      },
    });

    await transaction.auditLog.create({
      data: {
        userId: verifiedUser.id,
        action: AuditAction.OTP_VERIFIED,
        metadata: {
          phone: maskPhone(normalizedPhone),
        },
      },
    });

    return verifiedUser;
  });

  return {
    success: true,
    userId: user.id,
    role: user.role,
  };
}
