import { ERROR_CODES, error, success } from "@/lib/api/response";
import { withAuth } from "@/lib/auth/rbac";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (_request, _context, session) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      logger.warn("api.auth.me", "Session user was not found", {
        userId: session.userId,
      });

      return error("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    logger.debug("api.auth.me", "Current user fetched", {
      userId: user.id,
    });

    return success({
      user,
    });
  } catch (cause) {
    logger.error("api.auth.me", "Unexpected current user lookup error", {
      cause,
      userId: session.userId,
    });

    return error("Unexpected current user lookup error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
});
