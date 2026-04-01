"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_PARK, type ParkId } from "@/lib/maps/park-options";
import { AnalysisBirdingOutlook } from "./analysis-birding-outlook";
import { AnalysisMapPanel } from "./analysis-map-panel";

export function AnalysisScreen() {
  const [selectedParkId, setSelectedParkId] = useState<ParkId>(DEFAULT_PARK.id);

  return (
    <div className="space-y-[var(--analysis-section-gap)]">
      <AnalysisMapPanel
        parkId={selectedParkId}
        onParkChange={setSelectedParkId}
      />
      <AnalysisBirdingOutlook parkId={selectedParkId} />

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
