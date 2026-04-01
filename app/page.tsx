import { cookies } from "next/headers";
import {
  AUTH_SESSION_COOKIE_NAME,
  getAuthSessionSnapshot,
} from "@/lib/auth/session-store";
import { MobileShell } from "./_components/mobile-shell";

export default async function HomePage() {
  const cookieStore = await cookies();
  const initialAuthSession = getAuthSessionSnapshot(
    cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value,
  );

  return (
    <main className="min-h-dvh w-full overflow-hidden bg-[var(--shell-canvas)]">
      <MobileShell initialAuthSession={initialAuthSession} />
    </main>
  );
}
