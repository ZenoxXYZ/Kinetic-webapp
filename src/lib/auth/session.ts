import type { UserRole } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";

import { appConfig } from "@/lib/config/app";
import { env } from "@/lib/config/env";

export type SessionPayload = {
  userId: string;
  role: UserRole;
};

type JwtPayload = SessionPayload & {
  iat?: number;
  exp?: number;
};

const SESSION_COOKIE_NAME = appConfig.auth.sessionCookieName;
const SESSION_MAX_AGE_SECONDS =
  appConfig.auth.jwtSessionLifetimeDays * 24 * 60 * 60;

const getSecret = () => new TextEncoder().encode(env.AUTH_SECRET);

export async function signToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${appConfig.auth.jwtSessionLifetimeDays}d`)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
