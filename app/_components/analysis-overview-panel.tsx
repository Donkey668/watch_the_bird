"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AnalysisOverviewSnapshot } from "@/lib/weather/birding-outlook";

type AnalysisOverviewPanelProps = {
  isLoading: boolean;
  overview?: AnalysisOverviewSnapshot | null;
};

type OverviewNoteKey =
  | "habitatActivity"
  | "migrationSignal"
  | "observationConfidence";

type ValueAppearance = {
  pillClassName: string;
  iconClassName: string;
};

const OVERVIEW_NOTES: Record<
  OverviewNoteKey,
  { title: string; description: string }
> = {
  habitatActivity: {
    title: "栖息地活跃度说明",
    description:
      "栖息地活跃度与栖息地种群活动强度有关，分为“较高”“中等”“较低”。",
  },
  migrationSignal: {
    title: "迁徙信号说明",
    description:
      "迁徙信号与栖息地候鸟过境强度有关，分为“极高”“较高”“中等”“较低”。",
  },
  observationConfidence: {
    title: "观测可信度说明",
    description:
      "观测可信度与鸟种记录的可靠性有关，分为“稳定”“一般”“偏低”。",
  },
};

function LoadingOverviewRows() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-40 animate-pulse rounded-md bg-[var(--surface-muted)]" />
      <div className="space-y-2 rounded-xl border border-dashed border-[var(--border-subtle)] p-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`analysis-overview-loading-${index}`}
            className="h-12 animate-pulse rounded-lg bg-[var(--surface-muted)]"
          />
        ))}
      </div>
    </div>
  );
}

function getValueAppearance(
  label: string,
  value: string,
  isUnavailable = false,
): ValueAppearance {
  if (isUnavailable) {
    return {
      pillClassName: "border-amber-200 bg-amber-50 text-amber-900",
      iconClassName: "bg-amber-500",
    };
  }

  if (label === "栖息地活跃度") {
    if (value === "较高") {
      return {
        pillClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClassName: "bg-emerald-500",
      };
    }

    if (value === "中等") {
      return {
        pillClassName: "border-amber-200 bg-amber-50 text-amber-900",
        iconClassName: "bg-amber-500",
      };
    }

    return {
      pillClassName: "border-rose-200 bg-rose-50 text-rose-900",
      iconClassName: "bg-rose-500",
    };
  }

  if (label === "迁徙信号") {
    if (value === "极高") {
      return {
        pillClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClassName: "bg-emerald-500",
      };
    }

    if (value === "较高") {
      return {
        pillClassName: "border-sky-200 bg-sky-50 text-sky-900",
        iconClassName: "bg-sky-500",
      };
    }

    if (value === "中等") {
      return {
        pillClassName: "border-amber-200 bg-amber-50 text-amber-900",
        iconClassName: "bg-amber-500",
      };
    }

    return {
      pillClassName: "border-rose-200 bg-rose-50 text-rose-900",
      iconClassName: "bg-rose-500",
    };
  }

  if (label === "观测可信度") {
    if (value === "稳定") {
      return {
        pillClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClassName: "bg-emerald-500",
      };
    }

    if (value === "一般") {
      return {
        pillClassName: "border-amber-200 bg-amber-50 text-amber-900",
        iconClassName: "bg-amber-500",
      };
    }

    if (value === "偏低") {
      return {
        pillClassName: "border-rose-200 bg-rose-50 text-rose-900",
        iconClassName: "bg-rose-500",
      };
    }
  }

  return {
    pillClassName: "border-slate-200 bg-slate-100 text-slate-900",
    iconClassName: "bg-slate-500",
  };
}

function NoteDialog({
  noteKey,
  onClose,
}: {
  noteKey: OverviewNoteKey | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!noteKey) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [noteKey, onClose]);

  if (!noteKey) {
    return null;
  }

  const note = OVERVIEW_NOTES[noteKey];

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 p-4"
      onClick={onClose}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby={`analysis-overview-note-${noteKey}`}
        className="w-full max-w-sm shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle id={`analysis-overview-note-${noteKey}`}>
              {note.title}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="关闭说明弹窗"
            >
              ×
            </Button>
          </div>
          <CardDescription>{note.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end pt-0">
          <Button type="button" size="sm" onClick={onClose}>
            我知道了
          </Button>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}

function NoteButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 rounded-full border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      aria-label={`查看${label}说明`}
      onClick={onClick}
    >
      ?
    </Button>
  );
}

function ValueBadge({
  label,
  value,
  isUnavailable = false,
}: {
  label: string;
  value: string;
  isUnavailable?: boolean;
}) {
  const appearance = getValueAppearance(label, value, isUnavailable);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        appearance.pillClassName,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2.5 rounded-full", appearance.iconClassName)}
      />
      {value}
    </span>
  );
}

function OverviewRow({
  label,
  value,
  noteKey,
  isUnavailable = false,
  onOpenNote,
}: {
  label: string;
  value: string;
  noteKey: OverviewNoteKey;
  isUnavailable?: boolean;
  onOpenNote: (noteKey: OverviewNoteKey) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        <NoteButton label={label} onClick={() => onOpenNote(noteKey)} />
      </div>
      <ValueBadge label={label} value={value} isUnavailable={isUnavailable} />
    </div>
  );
}

export function AnalysisOverviewPanel({
  isLoading,
  overview,
}: AnalysisOverviewPanelProps) {
  const [activeNote, setActiveNote] = useState<OverviewNoteKey | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">分析总览</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LoadingOverviewRows />
        </CardContent>
      </Card>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{overview.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm font-medium leading-6 text-[var(--text-primary)]">
            {overview.beijingTime.displayText}
          </p>

          <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div className="space-y-3">
              <OverviewRow
                label={overview.habitatActivity.label}
                value={overview.habitatActivity.value}
                noteKey="habitatActivity"
                isUnavailable={overview.habitatActivity.status === "unavailable"}
                onOpenNote={setActiveNote}
              />
              <Separator />
              <OverviewRow
                label={overview.migrationSignal.label}
                value={overview.migrationSignal.value}
                noteKey="migrationSignal"
                onOpenNote={setActiveNote}
              />
              <Separator />
              <OverviewRow
                label={overview.observationConfidence.label}
                value={overview.observationConfidence.value}
                noteKey="observationConfidence"
                onOpenNote={setActiveNote}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <NoteDialog noteKey={activeNote} onClose={() => setActiveNote(null)} />
    </>
  );
}
