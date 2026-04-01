import { cookies } from "next/headers";
import { authenticateLogin } from "@/lib/auth/login";
import {
  AUTH_SESSION_COOKIE_NAME,
  createAuthSession,
  getAuthSessionCookieOptions,
} from "@/lib/auth/session-store";

export async function POST(request: Request) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const { statusCode, response } = authenticateLogin(payload);

  if (statusCode === 200 && response.assistantAccount) {
    const { sessionId } = createAuthSession(response.assistantAccount);
    const cookieStore = await cookies();

    cookieStore.set(
      AUTH_SESSION_COOKIE_NAME,
      sessionId,
      getAuthSessionCookieOptions(),
    );
  }

  return Response.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store",
      "Content-Language": "zh-CN",
    },
  });
}
