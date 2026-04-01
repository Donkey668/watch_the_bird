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
import {
  DEFAULT_PARK,
  getParkById,
  type ParkId,
} from "@/lib/maps/park-options";
import type {
  BirdSpeciesRecord,
  SpeciesReferenceResponse,
  SpeciesReferenceView,
} from "@/lib/species/habitat-species-reference";
import { cn } from "@/lib/utils";

type AnalysisHabitatSpeciesReferenceProps = {
  parkId: ParkId;
};

type SpeciesRequestResult = {
  ok: boolean;
  payload: SpeciesReferenceResponse;
};

const INITIAL_TRANSPORT_ERROR =
  "鸟种参考服务暂时不可用，请稍后重试。";
const FULL_TRANSPORT_ERROR =
  "完整鸟种参考暂时无法加载，请稍后重试。";

async function requestSpeciesReference(
  parkId: ParkId,
  view: SpeciesReferenceView,
  signal: AbortSignal,
): Promise<SpeciesRequestResult> {
  const response = await fetch(
    `/api/analysis/habitat-species-reference?parkId=${encodeURIComponent(parkId)}&view=${view}`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  const payload = (await response.json()) as SpeciesReferenceResponse;

  return {
    ok: response.ok,
    payload,
  };
}

function LoadingCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`species-reference-loading-${index}`}
          className="h-28 animate-pulse rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)]"
        />
      ))}
    </div>
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium leading-5 text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="break-words text-sm font-medium leading-6 text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function SpeciesCard({
  record,
  onClick,
}: {
  record: BirdSpeciesRecord;
  onClick: (record: BirdSpeciesRecord) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group w-full snap-start rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left transition-colors duration-200",
        "hover:border-[var(--accent)]/35 hover:bg-[var(--surface-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]",
        "active:scale-[0.99]",
      )}
      onClick={() => onClick(record)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium leading-5 text-[var(--text-secondary)]">
            {`序号 ${record.sequence}`}
          </p>
          <h4 className="break-words text-base font-semibold leading-6 text-[var(--text-primary)]">
            {record.speciesName}
          </h4>
        </div>

        <span className="rounded-full border border-[var(--border-subtle)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-primary)]">
          查看详情
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <FieldRow label="居留类型" value={record.residencyType} />
        <FieldRow label="保护级别" value={record.protectionLevel} />
      </div>
    </button>
  );
}

function FatalState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-rose-900">{title}</p>
        <p className="text-sm leading-6 text-rose-900/85">{description}</p>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function AnalysisHabitatSpeciesReference({
  parkId,
}: AnalysisHabitatSpeciesReferenceProps) {
  const [retryNonce, setRetryNonce] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [transportError, setTransportError] = useState<string | null>(null);
  const [fullLoadError, setFullLoadError] = useState<string | null>(null);
  const [response, setResponse] = useState<SpeciesReferenceResponse | null>(null);
  const [activeRecord, setActiveRecord] = useState<BirdSpeciesRecord | null>(
    null,
  );
  const previewRequestVersionRef = useRef(0);
  const fullRequestVersionRef = useRef(0);
  const fullRequestAbortRef = useRef<AbortController | null>(null);

  const selectedPark = useMemo(
    () => getParkById(parkId) ?? DEFAULT_PARK,
    [parkId],
  );

  useEffect(() => {
    const requestVersion = ++previewRequestVersionRef.current;
    const controller = new AbortController();

    setIsInitialLoading(true);
    setIsFullLoading(false);
    setTransportError(null);
    setFullLoadError(null);
    setResponse(null);
    setActiveRecord(null);

    async function loadPreview() {
      try {
        const result = await requestSpeciesReference(
          parkId,
          "preview",
          controller.signal,
        );

        if (
          controller.signal.aborted ||
          requestVersion !== previewRequestVersionRef.current
        ) {
          return;
        }

        setResponse(result.payload);
        setTransportError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setTransportError(INITIAL_TRANSPORT_ERROR);
      } finally {
        if (
          !controller.signal.aborted &&
          requestVersion === previewRequestVersionRef.current
        ) {
          setIsInitialLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      controller.abort();
      fullRequestAbortRef.current?.abort();
    };
  }, [parkId, retryNonce]);

  useEffect(() => {
    if (!activeRecord || !response?.collection) {
      return;
    }

    const isStillVisible = response.collection.records.some(
      (record) =>
        record.sequence === activeRecord.sequence &&
        record.speciesName === activeRecord.speciesName,
    );

    if (!isStillVisible) {
      setActiveRecord(null);
    }
  }, [activeRecord, response]);

  const handleRetry = useCallback(() => {
    setRetryNonce((current) => current + 1);
  }, []);

  const handleLoadFull = useCallback(async () => {
    if (
      isFullLoading ||
      !response?.collection ||
      response.collection.view === "full" ||
      !response.collection.hasMore
    ) {
      return;
    }

    const requestVersion = ++fullRequestVersionRef.current;
    const controller = new AbortController();
    fullRequestAbortRef.current?.abort();
    fullRequestAbortRef.current = controller;

    setIsFullLoading(true);
    setFullLoadError(null);

    try {
      const result = await requestSpeciesReference(parkId, "full", controller.signal);

      if (
        controller.signal.aborted ||
        requestVersion !== fullRequestVersionRef.current
      ) {
        return;
      }

      if (
        result.ok &&
        (result.payload.requestStatus === "success" ||
          result.payload.requestStatus === "empty")
      ) {
        setResponse(result.payload);
        return;
      }

      setFullLoadError(result.payload.message || FULL_TRANSPORT_ERROR);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setFullLoadError(FULL_TRANSPORT_ERROR);
    } finally {
      if (requestVersion === fullRequestVersionRef.current) {
        setIsFullLoading(false);
        fullRequestAbortRef.current = null;
      }
    }
  }, [isFullLoading, parkId, response]);

  const collection = response?.collection ?? null;
  const hasPreviewData =
    response?.requestStatus === "success" && Boolean(collection?.records.length);
  const isFatalError =
    transportError !== null ||
    response?.requestStatus === "failed" ||
    response?.requestStatus === "invalid_park";

  return (
    <>
      <Card className="overflow-hidden" aria-live="polite">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">栖息地鸟种参考</CardTitle>
          <CardDescription className="text-xs leading-5">
            {`以下条目来自 ${selectedPark.name} 的近年鸟类观测记录，默认展示前 10 条，点击卡片可查看生态特征与观测难度。`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {isInitialLoading ? <LoadingCards /> : null}

          {!isInitialLoading && isFatalError ? (
            <FatalState
              title="当前无法加载鸟种参考"
              description={
                transportError ||
                response?.message ||
                "鸟种参考信息暂时不可用，请稍后重试。"
              }
              actionLabel="重新获取"
              onAction={handleRetry}
            />
          ) : null}

          {!isInitialLoading &&
          !isFatalError &&
          response?.requestStatus === "empty" &&
          collection ? (
            <div className="space-y-2 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">
                当前暂无可展示的鸟种参考记录
              </p>
              <p>{response.message}</p>
            </div>
          ) : null}

          {!isInitialLoading && hasPreviewData && collection ? (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                <span>{response?.message}</span>
                <span>{`当前展示 ${collection.returnedCount} / ${collection.totalCount} 条`}</span>
              </div>

              <div className="max-h-[30rem] snap-y snap-proximity space-y-3 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
                {collection.records.map((record) => (
                  <SpeciesCard
                    key={`${record.sequence}-${record.speciesName}`}
                    record={record}
                    onClick={setActiveRecord}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {fullLoadError ? (
                  <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    <p className="font-medium">
                      完整列表加载失败，当前仍显示预览结果。
                    </p>
                    <p>{fullLoadError}</p>
                  </div>
                ) : null}

                {collection.view === "preview" && collection.hasMore ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleLoadFull}
                    disabled={isFullLoading}
                  >
                    {isFullLoading ? "正在加载全部信息..." : "点击查看全部信息"}
                  </Button>
                ) : (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-center text-sm leading-6 text-[var(--text-secondary)]">
                    {`已展示全部 ${collection.totalCount} 条鸟种记录。`}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={activeRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveRecord(null);
          }
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0">
          {activeRecord ? (
            <div className="p-5">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-lg">
                  {activeRecord.speciesName}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6">
                  {`序号 ${activeRecord.sequence} · ${activeRecord.residencyType} · ${activeRecord.protectionLevel}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    生态特征
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {activeRecord.ecologicalTraits}
                  </p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    观测难度
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {activeRecord.observationDifficulty}
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-5">
                <DialogClose asChild>
                  <Button type="button" className="w-full sm:w-auto">
                    关闭
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
