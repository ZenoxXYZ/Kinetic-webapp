import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalString = () =>
  z.preprocess(emptyStringToUndefined, z.string().min(1).optional());

const optionalUrl = () =>
  z.preprocess(emptyStringToUndefined, z.string().url().optional());

const booleanFromString = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    AUTH_SECRET: z.string().min(32),
    OTP_PEPPER: z.string().min(32),
    SMS_USE_MOCK: booleanFromString,
    SMS_GATEWAY_URL: optionalUrl(),
    SMS_GATEWAY_AUTH_HEADER: optionalString(),
    SMS_GATEWAY_AUTH_VALUE: optionalString(),
    SMS_GATEWAY_PAYLOAD_TEMPLATE: optionalString(),
    SMS_OTP_TEMPLATE: z.string().min(1),
    GOOGLE_CLIENT_ID: optionalString(),
    GOOGLE_CLIENT_SECRET: optionalString(),
    GOOGLE_REDIRECT_URI: optionalUrl(),
  })
  .superRefine((value, context) => {
    if (!value.SMS_USE_MOCK) {
      const requiredSmsKeys = [
        "SMS_GATEWAY_URL",
        "SMS_GATEWAY_AUTH_HEADER",
        "SMS_GATEWAY_AUTH_VALUE",
        "SMS_GATEWAY_PAYLOAD_TEMPLATE",
      ] as const;

      for (const key of requiredSmsKeys) {
        if (!value[key]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when SMS_USE_MOCK=false`,
          });
        }
      }
    }

    if (value.SMS_GATEWAY_PAYLOAD_TEMPLATE) {
      try {
        const parsed = JSON.parse(value.SMS_GATEWAY_PAYLOAD_TEMPLATE);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["SMS_GATEWAY_PAYLOAD_TEMPLATE"],
            message: "SMS_GATEWAY_PAYLOAD_TEMPLATE must be a JSON object",
          });
        }
      } catch {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["SMS_GATEWAY_PAYLOAD_TEMPLATE"],
          message: "SMS_GATEWAY_PAYLOAD_TEMPLATE must be valid JSON",
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => {
      const name = issue.path.join(".") || "ENV";
      return `- ${name}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsedEnv.data;
export type Env = typeof env;
