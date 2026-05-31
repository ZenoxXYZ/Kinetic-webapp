import { logger } from "@/lib/logger";

export async function sendMockOTP(phone: string, otp: string) {
  logger.info("sms.mock", "Mock OTP generated", {
    phone,
    otp,
  });

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}
