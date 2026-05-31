import type { UserRole } from "@prisma/client";
import type { NextRequest } from "next/server";

import { ERROR_CODES, error as apiError } from "@/lib/api/response";
import {
  getSessionFromRequest,
  type SessionPayload,
} from "@/lib/auth/session";

type RouteContext = Record<string, unknown>;
type AuthenticatedHandler<TContext extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: TContext,
  session: SessionPayload,
) => Promise<Response> | Response;

export function hasRole(session: SessionPayload | null, role: UserRole) {
  return session?.role === role;
}

export function requireRole(session: SessionPayload | null, role: UserRole) {
  if (!hasRole(session, role)) {
    throw new Error(`Required role: ${role}`);
  }
}

export function isStudent(session: SessionPayload | null) {
  return hasRole(session, "STUDENT");
}

export function isMentor(session: SessionPayload | null) {
  return hasRole(session, "MENTOR");
}

export function isAdmin(session: SessionPayload | null) {
  return hasRole(session, "ADMIN");
}

export function withAuth<TContext extends RouteContext = RouteContext>(
  handler: AuthenticatedHandler<TContext>,
  requiredRole?: UserRole,
) {
  return async (request: NextRequest, context: TContext) => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return apiError("Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
    }

    if (requiredRole && !hasRole(session, requiredRole)) {
      return apiError("Insufficient permissions", ERROR_CODES.FORBIDDEN, 403);
    }

    return handler(request, context, session);
  };
}
