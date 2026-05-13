import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { RoleCode } from "@prisma/client";
import { sessionCookieName } from "@/lib/session-constants";
import { sessionSecret } from "@/lib/session-secret";

export type SessionPayload = {
  userId: string;
  companyId: string;
  role: RoleCode;
};

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret());
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, sessionSecret());
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(sessionCookieName);
}
