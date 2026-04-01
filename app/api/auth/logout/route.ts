import { cookies } from "next/headers";
import {
  AUTH_SESSION_COOKIE_NAME,
  clearAuthSession,
} from "@/lib/auth/session-store";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  clearAuthSession(sessionId);
  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);

  return Response.json(
    {
      requestStatus: "success",
      message: "已退出登录。",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Language": "zh-CN",
      },
    },
  );
}
