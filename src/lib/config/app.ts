export const appConfig = {
  name: "Kinetic Academy",
  supportedExamTypes: [
    { id: "IBA", label: "IBA", prismaValue: "IBA" },
    { id: "MEDICAL", label: "Medical", prismaValue: "MEDICAL" },
    { id: "B_UNIT", label: "B Unit", prismaValue: "DHAKA_B_UNIT" },
    { id: "C_UNIT", label: "C Unit", prismaValue: "DHAKA_C_UNIT" },
    { id: "D_UNIT", label: "D Unit", prismaValue: "DHAKA_D_UNIT" },
  ] as const,
  auth: {
    otpExpiryMinutes: 5,
    otpLength: 6,
    maxOtpAttempts: 5,
    otpCooldownSeconds: 60,
    jwtSessionLifetimeDays: 30,
    sessionCookieName: "kinetic_session",
  },
} as const;

export type SupportedExamType = (typeof appConfig.supportedExamTypes)[number];
