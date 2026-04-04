"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  DEFAULT_PARK,
  getParkById,
  type ParkId,
} from "@/lib/maps/park-options";
import type {
  BirdingIndexLevel,
  BirdingOutlookResponse,
  WeatherDetail,
} from "@/lib/weather/birding-outlook";
import { AnalysisOverviewPanel } from "./analysis-overview-panel";
import { AnalysisForecastWarningModal } from "./analysis-forecast-warning-modal";

type AnalysisBirdingOutlookProps = {
  parkId: ParkId;
};

type OutlookLoadState =
  | {
      requestKey: string | null;
      response: BirdingOutlookResponse;
      transportError: null;
    }
  | {
      requestKey: string | null;
      response: null;
      transportError: string;
    };

function getBirdingIndexClasses(level: BirdingIndexLevel | null) {
  if (level === "\u9002\u5b9c") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (level === "\u8f83\u9002\u5b9c") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (level === "\u4e0d\u9002\u5b9c") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-900";
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
      <div className="space-y-2 rounded-xl border border-dashed border-[var(--border-subtle)] p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`loading-row-${index}`}
            className="h-9 animate-pulse rounded-md bg-[var(--surface-muted)]"
          />
        ))}
      </div>
    </div>
  );
}

function WeatherDetailRows({ details }: { details: WeatherDetail[] }) {
  return (
    <div className="space-y-2">
      {details.map((detail, index) => (
        <div key={detail.key} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="w-[var(--analysis-detail-label-width)] flex-none text-sm font-medium text-[var(--text-secondary)]">
              {detail.label}
            </span>
            <span className="min-w-0 break-words text-right text-sm leading-6 text-[var(--text-primary)]">
              {detail.value}
            </span>
          </div>
          {index < details.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  );
}

export function AnalysisBirdingOutlook({
  parkId,
}: AnalysisBirdingOutlookProps) {
  const [retryNonce, setRetryNonce] = useState(0);
  const [isForecastWarningOpen, setIsForecastWarningOpen] = useState(false);
  const [loadState, setLoadState] = useState<OutlookLoadState | null>(null);
  const requestVersionRef = useRef(0);
  const requestKey = `${parkId}:${retryNonce}`;

  const selectedPark = useMemo(
    () => getParkById(parkId) ?? DEFAULT_PARK,
    [parkId],
  );

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;
    const controller = new AbortController();

    async function loadOutlook() {
      try {
        const response = await fetch(
          `/api/analysis/birding-outlook?parkId=${encodeURIComponent(parkId)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload = (await response.json()) as BirdingOutlookResponse;
        if (
          controller.signal.aborted ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        setLoadState({
          requestKey,
          response: payload,
          transportError: null,
        });
      } catch (error) {
        if (
          controller.signal.aborted ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadState({
          requestKey,
          response: null,
          transportError:
            "\u89c2\u9e1f\u6307\u6570\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
        });
      }
    }

    void loadOutlook();

    return () => {
      controller.abort();
    };
  }, [parkId, requestKey, retryNonce]);

  const handleRetry = useCallback(() => {
    setRetryNonce((current) => current + 1);
  }, []);

  const isResolvedCurrentRequest = loadState?.requestKey === requestKey;
  const response = isResolvedCurrentRequest ? loadState?.response ?? null : null;
  const requestStatus = response?.requestStatus ?? null;
  const weather = response?.weather ?? null;
  const birdingIndex = response?.birdingIndex ?? null;
  const districtName = response?.park?.districtName ?? selectedPark.districtName;
  const isLoading = !isResolvedCurrentRequest;
  const isFailed =
    Boolean(isResolvedCurrentRequest && loadState?.transportError) ||
    requestStatus === "failed" ||
    requestStatus === "invalid_park";
  const analysisOverview =
    !isFailed && response?.analysisOverview ? response.analysisOverview : null;
  const birdingValue =
    birdingIndex?.status === "success" ? birdingIndex.level : null;
  const birdingCaption =
    birdingIndex?.status === "success" ? null : "\u89c2\u9e1f\u6307\u6570\u4e0d\u53ef\u7528\uff01";

  return (
    <Card className="overflow-hidden" aria-live="polite">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {"\u5929\u6c14\u4e0e\u89c2\u9e1f\u6307\u6570"}
        </CardTitle>
        <CardDescription className="text-xs leading-5">
          {`\u6839\u636e ${selectedPark.name} \u6240\u5728\u7684 ${districtName} \u5b9e\u65f6\u5929\u6c14\uff0c\u83b7\u53d6\u4eca\u65e5\u89c2\u9e1f\u6307\u6570\u3002`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {isLoading ? <LoadingRows /> : null}

        {isFailed ? (
          <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-900">
                {"\u5f53\u524d\u7ed3\u679c\u6682\u4e0d\u53ef\u7528"}
              </p>
              <p className="text-sm leading-6 text-rose-900/80">
                {loadState?.transportError
                  ? loadState.transportError
                  : response?.message ||
                    "\u5929\u6c14\u4fe1\u606f\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              {"\u91cd\u65b0\u83b7\u53d6"}
            </Button>
          </div>
        ) : null}

        {!isLoading && !isFailed && response ? (
          <>
            <section
              className={cn(
                "rounded-2xl border p-4",
                getBirdingIndexClasses(birdingValue),
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    {"\u4eca\u65e5\u89c2\u9e1f\u6307\u6570"}
                  </p>
                  <p className="text-2xl font-semibold leading-none">
                    {birdingValue ?? "\u6682\u4e0d\u53ef\u7528"}
                  </p>
                  {birdingCaption ? (
                    <p className="text-sm leading-6 opacity-80">
                      {birdingCaption}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-full border border-current/15 bg-white/55 px-3 py-1 text-xs font-medium">
                  {response.park?.districtName ?? districtName}
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {"\u4eca\u65e5\u5929\u6c14\u4fe1\u606f"}
                  </p>
                  <span className="text-xs text-[var(--text-secondary)]">
                    来源 高德天气
                  </span>
                </div>
                <p className="text-xs leading-5 text-[var(--text-secondary)]">
                  {response.message}
                </p>
              </div>

              {weather ? <WeatherDetailRows details={weather.details} /> : null}
            </section>

            <AnalysisOverviewPanel
              key={requestKey}
              isLoading={isLoading}
              overview={analysisOverview}
              embedded
            />

            <div className="flex items-center justify-between gap-3 text-xs leading-5 text-[var(--text-secondary)]">
              <span>
                {`\u8bf7\u6c42\u65f6\u95f4\uff1a${response.requestedAt}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRetry}
              >
                {"\u5237\u65b0\u7ed3\u679c"}
              </Button>
            </div>

            <Button
              type="button"
              className="w-full rounded-xl bg-emerald-800 text-white hover:bg-emerald-700"
              onClick={() => setIsForecastWarningOpen(true)}
            >
              点击获取预报预警
            </Button>
          </>
        ) : null}

        <AnalysisForecastWarningModal
          open={isForecastWarningOpen}
          onOpenChange={setIsForecastWarningOpen}
          parkId={parkId}
          parkName={selectedPark.name}
          districtName={districtName}
        />
      </CardContent>
    </Card>
  );
}
