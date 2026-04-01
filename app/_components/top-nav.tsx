"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ScreenId = "analysis" | "identify" | "records";

type TopNavProps = {
  activeTab: ScreenId;
  onSelect: (tab: ScreenId) => void;
  isTransitioning?: boolean;
};

const NAV_ITEMS: { id: ScreenId; label: string; shortLabel: string }[] = [
  { id: "analysis", label: "观鸟指数分析", shortLabel: "分析" },
  { id: "identify", label: "鸟类识别工具", shortLabel: "识别" },
  { id: "records", label: "个人观测记录", shortLabel: "记录" },
];

const ACTIVE_STYLES: Record<ScreenId, string> = {
  analysis: "border-emerald-700 bg-emerald-100 text-emerald-950",
  identify: "border-sky-700 bg-sky-100 text-sky-950",
  records: "border-amber-700 bg-amber-100 text-amber-950",
};

export function TopNav({
  activeTab,
  onSelect,
  isTransitioning = false,
}: TopNavProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--surface-base)]/95 backdrop-blur">
      <nav
        aria-label="观鸟助手主导航"
        className="mx-auto flex h-[var(--top-nav-height)] w-full max-w-[430px]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelect(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              aria-pressed={isActive}
              disabled={isTransitioning && isActive}
              data-transitioning={isTransitioning ? "true" : "false"}
              className={cn(
                "h-full flex-1 rounded-none border-b-2 border-transparent px-2 text-[13px] font-semibold tracking-wide",
                isActive
                  ? ACTIVE_STYLES[item.id]
                  : "text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)]",
              )}
            >
              {item.shortLabel}
            </Button>
          );
        })}
      </nav>
    </header>
  );
}
