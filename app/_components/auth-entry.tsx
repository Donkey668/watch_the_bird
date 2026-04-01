"use client";

import { useEffect, useRef, useState } from "react";
import type { AuthSessionSnapshot } from "@/lib/auth/login";
import { cn } from "@/lib/utils";

const AUTH_ENTRY_COPY = {
  guestAriaLabel: "登录注册入口",
  login: "登录",
  register: "注册",
  logout: "退出登录",
  logoutPending: "退出中...",
} as const;

type AuthEntryProps = {
  session: AuthSessionSnapshot;
  isLogoutSubmitting?: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => Promise<void>;
};

export function AuthEntry({
  session,
  isLogoutSubmitting = false,
  onOpenLogin,
  onOpenRegister,
  onLogout,
}: AuthEntryProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (session.status === "authenticated" && session.assistantAccount) {
    return (
      <div ref={menuRef} className="relative text-right">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`当前登录用户 @${session.assistantAccount}`}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="text-xs font-semibold leading-4 text-emerald-700 underline decoration-emerald-600/65 underline-offset-4 transition-colors hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
        >
          {`@${session.assistantAccount}`}
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-full z-40 mt-2 min-w-[7.5rem] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1 shadow-[0_16px_32px_-20px_rgba(31,42,31,0.6)]">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                await onLogout();
                setIsMenuOpen(false);
              }}
              disabled={isLogoutSubmitting}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-xs font-medium leading-4 text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]",
                isLogoutSubmitting && "cursor-not-allowed opacity-60",
              )}
            >
              {isLogoutSubmitting
                ? AUTH_ENTRY_COPY.logoutPending
                : AUTH_ENTRY_COPY.logout}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section
      aria-label={AUTH_ENTRY_COPY.guestAriaLabel}
      className="flex min-h-[var(--auth-entry-height)] items-center gap-3 text-xs font-semibold leading-4"
    >
      <button
        type="button"
        onClick={onOpenLogin}
        className="text-[var(--text-secondary)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
      >
        {AUTH_ENTRY_COPY.login}
      </button>
      <button
        type="button"
        onClick={onOpenRegister}
        className="text-[var(--text-secondary)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
      >
        {AUTH_ENTRY_COPY.register}
      </button>
    </section>
  );
}
