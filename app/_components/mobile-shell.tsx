"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalysisScreen } from "./analysis-screen";
import { IdentifyScreen } from "./identify-screen";
import { RecordsScreen } from "./records-screen";
import { ScreenFrame } from "./screen-frame";
import { TopNav, type ScreenId } from "./top-nav";

const TRANSITION_MS = 280;

function readLandscapeState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth > window.innerHeight;
}

export function MobileShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("analysis");
  const [isLandscape, setIsLandscape] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeScreenRef = useRef<ScreenId>("analysis");
  const queuedScreenRef = useRef<ScreenId | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const commitScreenRef = useRef<(nextScreen: ScreenId) => void>(() => {});

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

  return (
    <div className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden border-x border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top,_#fcfff8,_#f3f9ec_58%,_#edf4e8)] shadow-[0_0_0_1px_rgba(174,194,166,0.2),0_28px_88px_-34px_rgba(30,56,32,0.35)]">
      <TopNav
        activeTab={activeScreen}
        onSelect={handleSelect}
        isTransitioning={isTransitioning}
      />

      {isLandscape ? (
        <main className="h-full overflow-y-auto px-4 pb-6 pt-[calc(var(--top-nav-height)+1rem)]">
          <div className="mx-auto w-full max-w-[26rem]">
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
        <main className="relative h-full overflow-hidden">
          <ScreenFrame
            id="analysis"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <AnalysisScreen />
          </ScreenFrame>
          <ScreenFrame
            id="identify"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <IdentifyScreen />
          </ScreenFrame>
          <ScreenFrame
            id="records"
            activeId={activeScreen}
            reduceMotion={reduceMotion}
          >
            <RecordsScreen />
          </ScreenFrame>
        </main>
      )}
    </div>
  );
}
