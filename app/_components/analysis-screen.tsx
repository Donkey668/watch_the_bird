"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PARK, getParkById, type ParkId } from "@/lib/maps/park-options";
import { AnalysisBirdingOutlook } from "./analysis-birding-outlook";
import { AnalysisMapPanel } from "./analysis-map-panel";

const SNAPSHOT_ROWS = [
  {
    label: "栖息地活跃度",
    value: "中等",
    hint: "清晨与日落前后仍是最活跃的时段。",
  },
  {
    label: "迁徙信号",
    value: "上升",
    hint: "近 24 小时的迁徙路线活动有所增加。",
  },
  {
    label: "观测可信度",
    value: "稳定",
    hint: "各区域的观测质量保持一致。",
  },
];

export function AnalysisScreen() {
  const [selectedParkId, setSelectedParkId] = useState<ParkId>(DEFAULT_PARK.id);
  const selectedPark = useMemo(
    () => getParkById(selectedParkId) ?? DEFAULT_PARK,
    [selectedParkId],
  );

  return (
    <div className="space-y-[var(--analysis-section-gap)]">
      <AnalysisMapPanel
        parkId={selectedParkId}
        onParkChange={setSelectedParkId}
      />
      <AnalysisBirdingOutlook parkId={selectedParkId} />

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          分析总览
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          观鸟指数分析
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          分析流程会跟随当前选中的公园，优先展示对应区县的天气信息与当日观鸟指数，再呈现其余参考内容。
        </p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          当前公园：{selectedPark.name}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>今日概览</CardTitle>
          <CardDescription>
            这组占位摘要用于说明分析页面在 v1 移动网页中的定位。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SNAPSHOT_ROWS.map((row, index) => (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {row.label}
                </span>
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-strong)]">
                  {row.value}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{row.hint}</p>
              {index < SNAPSHOT_ROWS.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>如何使用本页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
          <p>
            这里是整个产品的分析入口，你可以随时通过左侧标签回到本页面。
          </p>
          <p>
            更深入的分析模块和图表能力暂不包含在当前移动网页版本中。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
