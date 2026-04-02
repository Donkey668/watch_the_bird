"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EncyclopediaSection } from "@/lib/identify/identify-contract";

type IdentifyEncyclopediaCardProps = {
  sections: EncyclopediaSection[];
  message?: string | null;
};

export function IdentifyEncyclopediaCard({
  sections,
  message,
}: IdentifyEncyclopediaCardProps) {
  if (sections.length === 0 && !message) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">鸟类百科简介</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {sections.map((section) => (
          <div
            key={section.key}
            className="space-y-1 rounded-xl bg-[var(--surface-muted)] px-4 py-3"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {section.label}
            </p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {section.content}
            </p>
          </div>
        ))}
        {sections.length === 0 && message ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-5">
            <p className="text-sm leading-6 text-amber-900">{message}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
