"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ParkId } from "@/lib/maps/park-options";
import type {
  DisasterWarningRecord,
  DistrictForecastRecord,
  ForecastWarningModule,
  ForecastWarningResponse,
  HourlyForecastRecord,
  SunMoonTimingRecord,
} from "@/lib/weather/sz-forecast-warning";

type AnalysisForecastWarningModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkId: ParkId;
  parkName: string;
  districtName: string;
};

type ForecastWarningLoadState =
  | {
      requestKey: string | null;
      response: ForecastWarningResponse;
      transportError: null;
    }
  | {
      requestKey: string | null;
      response: null;
      transportError: string;
    };

function ModuleLoadingSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`module-loading-row-${index}`}
          className="h-4 animate-pulse rounded bg-[var(--surface-muted)]"
        />
      ))}
    </div>
  );
}

function ModuleContainer<T>({
  title,
  module,
  isLoading,
  children,
}: React.PropsWithChildren<{
  title: string;
  module: ForecastWarningModule<T> | null;
  isLoading: boolean;
}>) {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {module ? (
          <span className="text-xs text-[var(--text-secondary)]">{`来源 ${module.source}`}</span>
        ) : null}
      </div>

      {isLoading ? <ModuleLoadingSkeleton rows={4} /> : null}

      {!isLoading && !module ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          当前模块暂无可展示数据。
        </p>
      ) : null}

      {!isLoading && module?.status === "failed" ? (
        <p className="text-sm leading-6 text-rose-700">{module.message}</p>
      ) : null}

      {!isLoading && module?.status === "empty" ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{module.message}</p>
      ) : null}

      {!isLoading && module?.status === "success" ? (
        <div className="space-y-2">
          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            {`${module.message}（${module.returnedCount} 条）`}
          </p>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function ForecastCard({
  line1,
  line2,
  line3,
  compactLineSpacing = false,
}: {
  line1: string;
  line2: string;
  line3: string;
  compactLineSpacing?: boolean;
}) {
  return (
    <article className="min-w-[9rem] snap-start rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-3 text-center">
      <p
        className={`${compactLineSpacing ? "" : "h-10 "}line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]`}
      >
        {line1}
      </p>
      <p className="mt-2 text-sm leading-5 text-[var(--text-primary)]">
        {line2}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{line3}</p>
    </article>
  );
}

function formatTemperatureValue(value: string) {
  const text = value.trim();
  if (!text || text === "暂无") {
    return text || "暂无";
  }

  return /^-?\d+(?:\.\d+)?$/.test(text) ? `${text}℃` : text;
}

type ForecastCardsListProps =
  | {
      records: HourlyForecastRecord[];
      type: "hourly";
    }
  | {
      records: DistrictForecastRecord[];
      type: "district";
    };

function ForecastCardsList({
  records,
  type,
}: ForecastCardsListProps) {
  if (records.length === 0) {
    return (
      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        当前暂无可展示记录。
      </p>
    );
  }

  if (type === "hourly") {
    return (
      <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        <div className="flex snap-x snap-mandatory gap-2 pr-1">
          {records.map((record) => (
            <ForecastCard
              key={`hourly-${record.recId}-${record.forecastTime}`}
              line1={record.weatherStatus}
              line2={formatTemperatureValue(record.qpfTemp)}
              line3={record.forecastTime}
              compactLineSpacing
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="flex snap-x snap-mandatory gap-2 pr-1">
        {records.map((record) => (
          <ForecastCard
            key={`district-${record.recId}-${record.forecastTime}`}
            line1={record.weatherStatus}
            line2={`${formatTemperatureValue(record.minTemperature)}/${formatTemperatureValue(record.maxTemperature)}`}
            line3={record.forecastTime}
          />
        ))}
      </div>
    </div>
  );
}

function SunMoonList({
  records,
}: {
  records: SunMoonTimingRecord[];
}) {
  if (records.length === 0) {
    return (
      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        当前暂无可展示记录。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record, index) => (
        <div key={`sun-moon-${record.keyId}-${record.forecastTime}-${record.attribName}-${index}`} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {record.attribName}
            </span>
            <span className="text-right text-sm text-[var(--text-primary)]">
              {record.attribValue}
            </span>
          </div>
          {index < records.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  );
}

function buildWarningLineText(record: DisasterWarningRecord) {
  if (record.isPlaceholder) {
    return "当前无生效信号。";
  }

  return `${record.sequence} ${record.signalType}${record.signalLevel}预警`;
}

function WarningList({
  records,
  onSelect,
}: {
  records: DisasterWarningRecord[];
  onSelect: (record: DisasterWarningRecord) => void;
}) {
  if (records.length === 0) {
    return (
      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        当前暂无可展示记录。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) =>
        record.isPlaceholder ? (
          <p
            key={`warning-placeholder-${record.sequence}`}
            className="text-sm leading-6 text-gray-400"
          >
            {buildWarningLineText(record)}
          </p>
        ) : (
          <button
            key={`warning-${record.sequence}-${record.issueTime}`}
            type="button"
            className={`w-full text-left text-sm leading-6 ${record.textColorToken} underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]`}
            onClick={() => onSelect(record)}
          >
            {buildWarningLineText(record)}
          </button>
        ),
      )}
    </div>
  );
}

export function AnalysisForecastWarningModal({
  open,
  onOpenChange,
  parkId,
  parkName,
  districtName,
}: AnalysisForecastWarningModalProps) {
  const [activeWarning, setActiveWarning] = useState<DisasterWarningRecord | null>(
    null,
  );
  const [retryNonce, setRetryNonce] = useState(0);
  const [loadState, setLoadState] = useState<ForecastWarningLoadState | null>(
    null,
  );
  const requestVersionRef = useRef(0);
  const requestKey = `${parkId}:${retryNonce}`;

  useEffect(() => {
    if (!open) {
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    const controller = new AbortController();

    async function loadForecastWarning() {
      try {
        const response = await fetch(
          `/api/analysis/forecast-warning?parkId=${encodeURIComponent(parkId)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload = (await response.json()) as ForecastWarningResponse;
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
          transportError: "预报预警服务暂时不可用，请稍后重试。",
        });
      }
    }

    void loadForecastWarning();

    return () => {
      controller.abort();
    };
  }, [open, parkId, requestKey]);

  const handleRetry = useCallback(() => {
    setRetryNonce((current) => current + 1);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setActiveWarning(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const isResolvedCurrentRequest = loadState?.requestKey === requestKey;
  const response = isResolvedCurrentRequest ? loadState?.response ?? null : null;
  const requestStatus = response?.requestStatus ?? null;
  const hourlyModule = response?.hourlyForecast ?? null;
  const districtModule = response?.districtForecast ?? null;
  const sunMoonModule = response?.sunMoonTiming ?? null;
  const warningModule = response?.disasterWarning ?? null;
  const isLoading = open && !isResolvedCurrentRequest;
  const isGlobalFailed =
    Boolean(isResolvedCurrentRequest && loadState?.transportError) ||
    requestStatus === "failed" ||
    requestStatus === "invalid_park";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg gap-0 p-0">
          <div className="max-h-[calc(100dvh-2rem)] space-y-4 overflow-y-auto p-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base">预报预警信息</DialogTitle>
              <DialogDescription className="text-xs leading-5">
                {`${parkName} · ${districtName}`}
              </DialogDescription>
            </DialogHeader>

            {isGlobalFailed ? (
              <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-900">
                  当前预报预警结果暂不可用
                </p>
                <p className="text-sm leading-6 text-rose-900/85">
                  {loadState?.transportError ||
                    response?.message ||
                    "预报预警服务暂时不可用，请稍后重试。"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                >
                  重新获取
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <ModuleContainer<HourlyForecastRecord>
                  title="分区逐时预报"
                  module={hourlyModule}
                  isLoading={isLoading}
                >
                  {hourlyModule?.status === "success" ? (
                    <ForecastCardsList records={hourlyModule.records} type="hourly" />
                  ) : null}
                </ModuleContainer>

                <ModuleContainer<DistrictForecastRecord>
                  title="全市天气预报"
                  module={districtModule}
                  isLoading={isLoading}
                >
                  {districtModule?.status === "success" ? (
                    <ForecastCardsList
                      records={districtModule.records}
                      type="district"
                    />
                  ) : null}
                </ModuleContainer>

                <ModuleContainer<SunMoonTimingRecord>
                  title="日出日落时刻"
                  module={sunMoonModule}
                  isLoading={isLoading}
                >
                  {sunMoonModule?.status === "success" ? (
                    <SunMoonList records={sunMoonModule.records} />
                  ) : null}
                </ModuleContainer>

                <ModuleContainer<DisasterWarningRecord>
                  title="灾害天气预警"
                  module={warningModule}
                  isLoading={isLoading}
                >
                  {warningModule?.status === "success" ? (
                    <WarningList
                      records={warningModule.records}
                      onSelect={setActiveWarning}
                    />
                  ) : null}
                </ModuleContainer>
              </div>
            )}

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
              >
                刷新预报预警信息
              </Button>
              <DialogClose asChild>
                <Button type="button" size="sm">
                  关闭
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeWarning !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setActiveWarning(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1rem)] max-w-md gap-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base">预警详情</DialogTitle>
            <DialogDescription className="text-xs leading-5">
              {activeWarning
                ? `${activeWarning.signalType}${activeWarning.signalLevel}预警`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {activeWarning ? (
            <div className="space-y-3">
              <section className="space-y-1">
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  发布内容
                </p>
                <p className="text-sm leading-6 text-[var(--text-primary)]">
                  {activeWarning.issueContent || "暂无发布内容。"}
                </p>
              </section>

              <section className="space-y-1">
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  影响区域
                </p>
                <p className="text-sm leading-6 text-[var(--text-primary)]">
                  {activeWarning.district || "暂无区域信息。"}
                </p>
              </section>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" size="sm">
                关闭
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
