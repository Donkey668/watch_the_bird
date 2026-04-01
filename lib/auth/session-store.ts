import { randomUUID } from "node:crypto";
import type { AuthSessionSnapshot } from "./login";

type StoredAuthSession = {
  assistantAccount: string;
  authenticatedAt: string;
};

const globalForAuthSession = globalThis as typeof globalThis & {
  __watchTheBirdAuthSessions?: Map<string, StoredAuthSession>;
};

const authSessions =
  globalForAuthSession.__watchTheBirdAuthSessions ??
  new Map<string, StoredAuthSession>();

if (!globalForAuthSession.__watchTheBirdAuthSessions) {
  globalForAuthSession.__watchTheBirdAuthSessions = authSessions;
}

export const AUTH_SESSION_COOKIE_NAME = "wtb_auth_session";

const AUTH_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const GUEST_AUTH_SESSION: AuthSessionSnapshot = {
  status: "guest",
  assistantAccount: null,
  authenticatedAt: null,
};

export function getAuthSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_SESSION_COOKIE_MAX_AGE,
  };
}

export function createAuthSession(assistantAccount: string) {
  const sessionId = randomUUID();
  const authenticatedAt = new Date().toISOString();

  authSessions.set(sessionId, {
    assistantAccount,
    authenticatedAt,
  });

  return {
    sessionId,
    snapshot: {
      status: "authenticated" as const,
      assistantAccount,
      authenticatedAt,
    },
  };
}

export function getAuthSessionSnapshot(
  sessionId: string | null | undefined,
): AuthSessionSnapshot {
  if (!sessionId) {
    return GUEST_AUTH_SESSION;
  }

  const session = authSessions.get(sessionId);

  if (!session) {
    return GUEST_AUTH_SESSION;
  }

  return {
    status: "authenticated",
    assistantAccount: session.assistantAccount,
    authenticatedAt: session.authenticatedAt,
  };
}

export function clearAuthSession(sessionId: string | null | undefined) {
  if (!sessionId) {
    return;
  }

  authSessions.delete(sessionId);
}
