"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BirdIdentifyResponse } from "@/lib/identify/identify-contract";

type IdentifyResultCardProps = {
  response: BirdIdentifyResponse | null;
  isLoading: boolean;
};

type NameRowProps = {
  label: string;
  value: string;
};

function NameRow({ label, value }: NameRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-[var(--surface-muted)] px-4 py-3">
      <span className="text-sm font-semibold text-gray-800">
        {label}
      </span>
      <span className="min-w-0 text-right text-sm leading-6 text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}

export function IdentifyResultCard({
  response,
  isLoading,
}: IdentifyResultCardProps) {
  const recognition = response?.recognition;

  return (
    <Card aria-live="polite">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">鸟类识别结果</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-8 text-center">
            <p className="text-base font-semibold text-emerald-900">
              识别中......
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900/75">
              正在分析图片中的主要鸟类，请稍候。
            </p>
          </div>
        ) : recognition?.status === "success" ? (
          <div className="space-y-3">
            <NameRow label="中文学名" value={recognition.speciesNameZh} />
            <NameRow label="英文学名" value={recognition.speciesNameEn} />
            <NameRow label="拉丁学名" value={recognition.speciesNameLa} />
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-5">
            <p className="text-sm leading-6 text-[var(--text-primary)]">
              {response?.message ?? "上传图片后即可查看识别结果。"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
