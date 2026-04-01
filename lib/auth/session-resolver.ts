import "server-only";

import { cookies } from "next/headers";
import {
  AUTH_SESSION_COOKIE_NAME,
  getAuthSessionSnapshot,
} from "./session-store";

export type AssistantAccountResolution =
  | {
      status: "authenticated";
      assistantAccount: string;
    }
  | {
      status: "guest";
    };

export async function resolveAssistantAccountFromCookies(): Promise<AssistantAccountResolution> {
  const cookieStore = await cookies();
  const sessionSnapshot = getAuthSessionSnapshot(
    cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value,
  );

  if (
    sessionSnapshot.status !== "authenticated" ||
    !sessionSnapshot.assistantAccount
  ) {
    return {
      status: "guest",
    };
  }

  return {
    status: "authenticated",
    assistantAccount: sessionSnapshot.assistantAccount,
  };
}
