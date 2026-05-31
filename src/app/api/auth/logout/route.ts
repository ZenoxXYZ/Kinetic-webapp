import { ERROR_CODES, error, success } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const response = success({
      message: "Logged out",
    });

    clearSessionCookie(response);
    logger.info("api.auth.logout", "Session cookie cleared");

    return response;
  } catch (cause) {
    logger.error("api.auth.logout", "Unexpected logout error", {
      cause,
    });

    return error("Unexpected logout error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
