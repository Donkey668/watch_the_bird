"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_PARK, type ParkId } from "@/lib/maps/park-options";
import { AnalysisBirdingOutlook } from "./analysis-birding-outlook";
import { AnalysisHabitatSpeciesReference } from "./analysis-habitat-species-reference";
import { AnalysisMapPanel } from "./analysis-map-panel";

export function AnalysisScreen() {
  const [selectedParkId, setSelectedParkId] = useState<ParkId>(DEFAULT_PARK.id);

  return (
    <div className="space-y-[var(--analysis-section-gap)]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          鸟况概览
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          观鸟指数分析
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          围绕当前公园查看地图、天气变化、观鸟指数与栖息地鸟种参考。
        </p>
      </header>

      <AnalysisMapPanel
        parkId={selectedParkId}
        onParkChange={setSelectedParkId}
      />
      <AnalysisBirdingOutlook parkId={selectedParkId} />
      <AnalysisHabitatSpeciesReference
        key={selectedParkId}
        parkId={selectedParkId}
      />

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
