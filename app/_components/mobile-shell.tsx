"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthSessionSnapshot, LoginResponse } from "@/lib/auth/login";
import { GUEST_AUTH_SESSION } from "@/lib/auth/session-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnalysisScreen } from "./analysis-screen";
import { AuthEntry } from "./auth-entry";
import { IdentifyScreen } from "./identify-screen";
import {
  LoginRegisterDialog,
  type AuthDialogMode,
} from "./login-register-dialog";
import { RecordsScreen } from "./records-screen";
import { RecordsAuthRequiredDialog } from "./records-auth-required-dialog";
import { ScreenFrame } from "./screen-frame";
import { TopNav, type ScreenId } from "./top-nav";

const TRANSITION_MS = 280;

type MobileShellProps = {
  initialAuthSession: AuthSessionSnapshot;
};

type AuthDialogSource = "entry" | "records";

function readLandscapeState() {
  if (typeof window === "undefined") {
    return false;
  }

  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const shouldEnforcePortraitMode = hasCoarsePointer && window.innerWidth <= 1024;
  if (!shouldEnforcePortraitMode) {
    return false;
  }

  return window.innerWidth > window.innerHeight;
}

export function MobileShell({ initialAuthSession }: MobileShellProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("analysis");
  const [isLandscape, setIsLandscape] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [authSession, setAuthSession] =
    useState<AuthSessionSnapshot>(initialAuthSession);
  const [authDialogMode, setAuthDialogMode] = useState<AuthDialogMode>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isLogoutSubmitting, setIsLogoutSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authDialogSource, setAuthDialogSource] =
    useState<AuthDialogSource>("entry");
  const [isRecordsReminderOpen, setIsRecordsReminderOpen] = useState(false);
  const [recordsAuthDismissedVersion, setRecordsAuthDismissedVersion] =
    useState(0);
  const [isDesktopTipOpen, setIsDesktopTipOpen] = useState(false);

  const activeScreenRef = useRef<ScreenId>("analysis");
  const queuedScreenRef = useRef<ScreenId | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const commitScreenRef = useRef<(nextScreen: ScreenId) => void>(() => {});
  const loginRequestVersionRef = useRef(0);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  const commitScreen = useCallback(
    (nextScreen: ScreenId) => {
      if (nextScreen === activeScreenRef.current) {
        setIsTransitioning(false);
        return;
      }

      clearTransitionTimer();
      activeScreenRef.current = nextScreen;
      setActiveScreen(nextScreen);

      const transitionMs = reduceMotion ? 0 : TRANSITION_MS;
      if (transitionMs === 0) {
        setIsTransitioning(false);

        const queued = queuedScreenRef.current;
        queuedScreenRef.current = null;

        if (queued && queued !== activeScreenRef.current) {
          commitScreenRef.current(queued);
        }
        return;
      }

      setIsTransitioning(true);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;

        const queued = queuedScreenRef.current;
        queuedScreenRef.current = null;

        if (queued && queued !== activeScreenRef.current) {
          commitScreenRef.current(queued);
        }
      }, transitionMs);
    },
    [clearTransitionTimer, reduceMotion],
  );

  useEffect(() => {
    commitScreenRef.current = commitScreen;
  }, [commitScreen]);

  const handleSelect = useCallback(
    (nextScreen: ScreenId) => {
      if (nextScreen === activeScreenRef.current && !isTransitioning) {
        return;
      }

      if (isTransitioning) {
        queuedScreenRef.current = nextScreen;
        return;
      }

      commitScreen(nextScreen);
    },
    [commitScreen, isTransitioning],
  );

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsDesktopTipOpen(desktopMediaQuery.matches);
  }, []);

  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(readLandscapeState());
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimer();
    };
  }, [clearTransitionTimer]);

  const openAuthDialog = useCallback(
    (
      mode: Exclude<AuthDialogMode, null>,
      source: AuthDialogSource = "entry",
    ) => {
      if (isLoginSubmitting) {
        return;
      }

      setLoginError(null);
      setAuthDialogSource(source);
      setIsRecordsReminderOpen(false);
      setAuthDialogMode(mode);
    },
    [isLoginSubmitting],
  );

  const closeAuthDialog = useCallback(() => {
    if (isLoginSubmitting) {
      return;
    }

    const shouldOpenRecordsReminder =
      authDialogSource === "records" && authSession.status === "guest";

    setAuthDialogMode(null);
    setLoginError(null);
    setAuthDialogSource("entry");

    if (shouldOpenRecordsReminder) {
      setRecordsAuthDismissedVersion((current) => current + 1);
      setIsRecordsReminderOpen(true);
    }
  }, [authDialogSource, authSession.status, isLoginSubmitting]);

  const handleLoginSubmit = useCallback(
    async ({
      assistantAccount,
      userPassword,
    }: {
      assistantAccount: string;
      userPassword: string;
    }) => {
      const requestVersion = ++loginRequestVersionRef.current;

      setIsLoginSubmitting(true);
      setLoginError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            assistantAccount,
            userPassword,
          }),
        });

        const payload = (await response.json()) as LoginResponse;

        if (requestVersion !== loginRequestVersionRef.current) {
          return;
        }

        if (
          response.ok &&
          payload.requestStatus === "success" &&
          payload.assistantAccount
        ) {
          setAuthSession({
            status: "authenticated",
            assistantAccount: payload.assistantAccount,
            authenticatedAt: new Date().toISOString(),
          });
          setAuthDialogMode(null);
          setAuthDialogSource("entry");
          setIsRecordsReminderOpen(false);
          setLoginError(null);
          return;
        }

        setLoginError(payload.message);
      } catch {
        if (requestVersion !== loginRequestVersionRef.current) {
          return;
        }

        setLoginError("登录服务暂时不可用，请稍后重试。");
      } finally {
        if (requestVersion === loginRequestVersionRef.current) {
          setIsLoginSubmitting(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (authSession.status === "authenticated") {
      setIsRecordsReminderOpen(false);
    }
  }, [authSession.status]);

  const handleLogout = useCallback(async () => {
    if (isLogoutSubmitting) {
      return;
    }

    setIsLogoutSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (response.ok) {
        setAuthSession(GUEST_AUTH_SESSION);
        setAuthDialogMode(null);
        setLoginError(null);
        setAuthDialogSource("entry");
        setIsRecordsReminderOpen(false);
        setRecordsAuthDismissedVersion((current) => current + 1);
      }
    } finally {
      setIsLogoutSubmitting(false);
    }
  }, [isLogoutSubmitting]);

  const handleRequireRecordsAuth = useCallback(() => {
    openAuthDialog("login", "records");
  }, [openAuthDialog]);

  const isAuthDialogOpen = authDialogMode !== null;

  function renderAuthEntry(className?: string) {
    return (
      <div
        className={cn(
          "flex justify-end",
          isAuthDialogOpen && "pointer-events-none opacity-70",
          className,
        )}
      >
        <AuthEntry
          session={authSession}
          isLogoutSubmitting={isLogoutSubmitting}
          onOpenLogin={() => openAuthDialog("login")}
          onOpenRegister={() => openAuthDialog("register")}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden border-x border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top,_#fcfff8,_#f3f9ec_58%,_#edf4e8)] shadow-[0_0_0_1px_rgba(174,194,166,0.2),0_28px_88px_-34px_rgba(30,56,32,0.35)]">
      <TopNav
        activeTab={activeScreen}
        onSelect={handleSelect}
        isTransitioning={isTransitioning}
      />

      {isLandscape ? (
        <main
          className={cn(
            "h-full overflow-y-auto px-4 pb-6 pt-[calc(var(--top-nav-height)+0.5rem)]",
            isAuthDialogOpen && "pointer-events-none",
          )}
        >
          <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-3">
            {renderAuthEntry("mt-[27px]")}
            <Card className="border-orange-300 bg-orange-50/75">
              <CardHeader>
                <CardTitle className="text-orange-900">
                  请切换为竖屏
                </CardTitle>
                <CardDescription className="text-orange-900/80">
                  当前移动页面不提供横屏专用布局。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-orange-900/85">
                  请将设备旋转回竖屏后继续浏览“分析”“识别”和“记录”页面。
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      ) : (
        <main
          className={cn(
            "relative h-full overflow-hidden",
            isAuthDialogOpen && "pointer-events-none",
          )}
        >
          <ScreenFrame
            id="analysis"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <div className="relative">
              {renderAuthEntry("absolute right-0 top-0 z-10")}
              <AnalysisScreen />
            </div>
          </ScreenFrame>
          <ScreenFrame
            id="identify"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <div className="relative">
              {renderAuthEntry("absolute right-0 top-0 z-10")}
              <IdentifyScreen />
            </div>
          </ScreenFrame>
          <ScreenFrame
            id="records"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <div className="relative">
              {renderAuthEntry("absolute right-0 top-0 z-10")}
              <RecordsScreen
                authSession={authSession}
                authPromptDismissedVersion={recordsAuthDismissedVersion}
                onRequireAuth={handleRequireRecordsAuth}
              />
            </div>
          </ScreenFrame>
        </main>
      )}

      <LoginRegisterDialog
        mode={authDialogMode}
        isSubmitting={isLoginSubmitting}
        loginError={loginError}
        onClose={closeAuthDialog}
        onLoginSubmit={handleLoginSubmit}
      />
      <RecordsAuthRequiredDialog
        open={isRecordsReminderOpen}
        title="请登录个人空间"
        message="请登录个人空间！"
        onOpenChange={setIsRecordsReminderOpen}
      />
      <Dialog open={isDesktopTipOpen} onOpenChange={setIsDesktopTipOpen}>
        <DialogContent
          className="max-w-[22rem]"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-lg">移动端体验最佳</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              为获得最佳浏览体验，请使用移动设备竖屏浏览本页面。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center sm:justify-center">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsDesktopTipOpen(false)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
