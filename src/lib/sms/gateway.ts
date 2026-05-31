import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import { sendMockOTP } from "@/lib/sms/mock";

export type SmsSendResult = {
  success: boolean;
  messageId?: string;
};

const replacePlaceholders = (value: string, phone: string, message: string, otp: string) =>
  value
    .replaceAll("{{phone}}", phone)
    .replaceAll("{{message}}", message)
    .replaceAll("{{otp}}", otp);

const replaceInJson = (
  value: unknown,
  phone: string,
  message: string,
  otp: string,
): unknown => {
  if (typeof value === "string") {
    return replacePlaceholders(value, phone, message, otp);
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceInJson(item, phone, message, otp));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceInJson(item, phone, message, otp),
      ]),
    );
  }

  return value;
};

const getMessageId = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  const candidate = record.messageId ?? record.id ?? record.sid;

  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(candidate);
  }

  return undefined;
};

async function sendGatewayOTP(phone: string, otp: string): Promise<SmsSendResult> {
  if (
    !env.SMS_GATEWAY_URL ||
    !env.SMS_GATEWAY_AUTH_HEADER ||
    !env.SMS_GATEWAY_AUTH_VALUE ||
    !env.SMS_GATEWAY_PAYLOAD_TEMPLATE
  ) {
    logger.error("sms.gateway", "SMS gateway is not fully configured");
    return { success: false };
  }

  const message = replacePlaceholders(env.SMS_OTP_TEMPLATE, phone, "", otp);
  const template = JSON.parse(env.SMS_GATEWAY_PAYLOAD_TEMPLATE);
  const payload = replaceInJson(template, phone, message, otp);

  try {
    const response = await fetch(env.SMS_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [env.SMS_GATEWAY_AUTH_HEADER]: env.SMS_GATEWAY_AUTH_VALUE,
      },
      body: JSON.stringify(payload),
    });

    let responseBody: unknown;
    const responseText = await response.text();

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = { raw: responseText };
      }
    }

    if (!response.ok) {
      logger.error("sms.gateway", "SMS gateway request failed", {
        status: response.status,
        body: responseBody,
      });

      return { success: false };
    }

    const messageId = getMessageId(responseBody);

    logger.info("sms.gateway", "OTP sent through SMS gateway", {
      phone,
      messageId,
    });

    return {
      success: true,
      messageId,
    };
  } catch (cause) {
    logger.error("sms.gateway", "SMS gateway request errored", {
      cause,
    });

    return { success: false };
  }
}

export async function sendOTP(phone: string, otp: string): Promise<SmsSendResult> {
  if (env.SMS_USE_MOCK) {
    return sendMockOTP(phone, otp);
  }

  return sendGatewayOTP(phone, otp);
}
