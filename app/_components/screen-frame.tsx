import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ScreenId } from "./top-nav";

const SCREEN_ORDER: ScreenId[] = ["analysis", "identify", "records"];

type ScreenFrameProps = {
  id: ScreenId;
  activeId: ScreenId;
  reduceMotion: boolean;
  children: ReactNode;
  className?: string;
};

export function ScreenFrame({
  id,
  activeId,
  reduceMotion,
  children,
  className,
}: ScreenFrameProps) {
  const activeIndex = SCREEN_ORDER.indexOf(activeId);
  const screenIndex = SCREEN_ORDER.indexOf(id);
  const isActive = id === activeId;

  const inactiveOffsetClass = reduceMotion
    ? ""
    : screenIndex < activeIndex
      ? "-translate-x-6"
      : "translate-x-6";

  return (
    <section
      aria-hidden={!isActive}
      className={cn(
        "absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pb-8 pt-[calc(var(--top-nav-height)+0.5rem)]",
        !reduceMotion && "transition-all duration-300 ease-out",
        isActive
          ? "translate-x-0 opacity-100"
          : cn("pointer-events-none opacity-0", inactiveOffsetClass),
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[26rem]">{children}</div>
    </section>
  );
}
