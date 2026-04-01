"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getMissingAMapEnvVars,
  loadAMap,
  type AMapMapInstance,
  type AMapMarkerInstance,
} from "@/lib/maps/amap-loader";
import {
  DEFAULT_PARK,
  getParkById,
  PARK_OPTIONS,
  type ParkId,
} from "@/lib/maps/park-options";

const DEFAULT_ZOOM = 13;

type AnalysisMapPanelProps = {
  parkId?: ParkId;
  onParkChange?: (parkId: ParkId) => void;
};

function formatMissingConfigMessage(missingConfig: string[]) {
  return `\u7f3a\u5c11\u5730\u56fe\u914d\u7f6e\uff1a${missingConfig.join(
    "\u3001",
  )}\u3002\u8bf7\u5148\u8865\u5145\u672c\u5730\u73af\u5883\u53d8\u91cf\u3002`;
}

export function AnalysisMapPanel({
  parkId,
  onParkChange,
}: AnalysisMapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AMapMapInstance | null>(null);
  const markerRef = useRef<AMapMarkerInstance | null>(null);
  const selectionVersionRef = useRef(0);
  const [uncontrolledParkId, setUncontrolledParkId] = useState<ParkId>(
    DEFAULT_PARK.id,
  );

  const selectedParkId = parkId ?? uncontrolledParkId;
  const selectedParkIdRef = useRef<ParkId>(selectedParkId);

  const [lastCommittedParkId, setLastCommittedParkId] = useState<ParkId>(
    DEFAULT_PARK.id,
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const selectedPark = useMemo(
    () => getParkById(selectedParkId) ?? DEFAULT_PARK,
    [selectedParkId],
  );

  const selectOptions = useMemo(
    () =>
      PARK_OPTIONS.map((park) => ({
        value: park.id,
        label: park.name,
      })),
    [],
  );

  const missingConfig = useMemo(() => getMissingAMapEnvVars(), []);
  const hasMissingConfig = missingConfig.length > 0;

  useEffect(() => {
    selectedParkIdRef.current = selectedParkId;
  }, [selectedParkId]);

  const resetMapInstance = useCallback(() => {
    if (markerRef.current?.setMap) {
      markerRef.current.setMap(null);
    }

    markerRef.current = null;
    mapRef.current?.destroy();
    mapRef.current = null;
    setIsMapReady(false);
    setIsSwitching(false);
  }, []);

  const applySelectedParkToMap = useCallback((nextParkId: ParkId) => {
    const nextPark = getParkById(nextParkId);
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!nextPark || !map || !marker) {
      return;
    }

    const currentSelectionVersion = ++selectionVersionRef.current;
    setIsSwitching(true);

    window.requestAnimationFrame(() => {
      if (currentSelectionVersion !== selectionVersionRef.current) {
        return;
      }

      try {
        map.setCenter(nextPark.location);
        marker.setPosition(nextPark.location);
        setLastCommittedParkId(nextPark.id);
        setErrorMessage(null);
      } catch {
        setErrorMessage(
          "\u5730\u56fe\u66f4\u65b0\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u5f53\u524d\u516c\u56ed\u3002",
        );
      } finally {
        setIsSwitching(false);
      }
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initializeMap = async () => {
      if (!mapContainerRef.current) {
        return;
      }

      if (hasMissingConfig) {
        setErrorMessage(formatMissingConfigMessage(missingConfig));
        return;
      }

      resetMapInstance();
      setErrorMessage(null);

      try {
        const AMap = await loadAMap();
        if (isCancelled || !mapContainerRef.current) {
          return;
        }

        const initialPark =
          getParkById(selectedParkIdRef.current) ?? DEFAULT_PARK;

        const map = new AMap.Map(mapContainerRef.current, {
          viewMode: "3D",
          center: initialPark.location,
          zoom: DEFAULT_ZOOM,
          resizeEnable: true,
          mapStyle: "amap://styles/normal",
        });

        const marker = new AMap.Marker({
          position: initialPark.location,
          title: initialPark.name,
        });

        map.add(marker);
        mapRef.current = map;
        markerRef.current = marker;
        setIsMapReady(true);
        setLastCommittedParkId(initialPark.id);
        setErrorMessage(null);
      } catch {
        if (!isCancelled) {
          resetMapInstance();
          setErrorMessage(
            "\u5730\u56fe\u52a0\u8f7d\u5931\u8d25\u3002\u4f60\u4ecd\u53ef\u4f7f\u7528\u516c\u56ed\u9009\u62e9\u5668\uff0c\u5e76\u5728\u7f51\u7edc\u6216\u9ad8\u5fb7\u670d\u52a1\u6062\u590d\u540e\u91cd\u8bd5\u3002",
          );
        }
      }
    };

    void initializeMap();

    return () => {
      isCancelled = true;
      resetMapInstance();
    };
  }, [hasMissingConfig, missingConfig, resetMapInstance, retryNonce]);

  useEffect(() => {
    if (!isMapReady || selectedParkId === lastCommittedParkId) {
      return;
    }

    applySelectedParkToMap(selectedParkId);
  }, [applySelectedParkToMap, isMapReady, lastCommittedParkId, selectedParkId]);

  const handleRetry = useCallback(() => {
    if (hasMissingConfig) {
      setErrorMessage(formatMissingConfigMessage(missingConfig));
      return;
    }

    setRetryNonce((current) => current + 1);
  }, [hasMissingConfig, missingConfig]);

  const handleSelectChange = useCallback(
    (nextValue: string) => {
      const nextParkId = nextValue as ParkId;
      if (!getParkById(nextParkId)) {
        return;
      }

      selectedParkIdRef.current = nextParkId;
      setUncontrolledParkId(nextParkId);
      onParkChange?.(nextParkId);
    },
    [onParkChange],
  );

  const helperText = isSwitching
    ? `\u6b63\u5728\u66f4\u65b0 ${selectedPark.name} \u7684\u5730\u56fe\u4f4d\u7f6e...`
    : `\u5f53\u524d\u516c\u56ed\uff1a${selectedPark.name}`;

  const overlayMessage = errorMessage || "\u5730\u56fe\u52a0\u8f7d\u4e2d...";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{"\u516c\u56ed\u5730\u56fe"}</CardTitle>
        <CardDescription className="text-xs leading-5">
          {
            "\u9009\u62e9\u9884\u8bbe\u516c\u56ed\uff0c\u5e76\u8ba9\u5f53\u524d\u5206\u6790\u4e0a\u4e0b\u6587\u59cb\u7ec8\u548c\u5730\u56fe\u4e0a\u7684\u6d3b\u52a8\u6807\u8bb0\u4fdd\u6301\u4e00\u81f4\u3002"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
          <div className="absolute right-2 top-2 z-20 w-[12rem]">
            <Select
              aria-label="\u9009\u62e9\u9884\u8bbe\u516c\u56ed"
              options={selectOptions}
              value={selectedParkId}
              onValueChange={handleSelectChange}
            />
          </div>

          <div
            ref={mapContainerRef}
            className="h-[var(--analysis-map-height)] w-full"
            aria-label="\u5206\u6790\u9875\u9762\u516c\u56ed\u5730\u56fe"
          />

          <div
            role={errorMessage ? "alert" : "status"}
            aria-live="polite"
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--surface-base)]/80 px-4 text-center text-sm text-[var(--text-secondary)] transition-opacity",
              isMapReady && !errorMessage
                ? "pointer-events-none opacity-0"
                : "opacity-100",
            )}
          >
            <p className="max-w-[18rem] leading-6">{overlayMessage}</p>
            {errorMessage && !hasMissingConfig ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
              >
                {"\u91cd\u65b0\u52a0\u8f7d\u5730\u56fe"}
              </Button>
            ) : null}
          </div>
        </div>

        <p
          aria-live="polite"
          className="text-xs leading-5 text-[var(--text-secondary)]"
        >
          {helperText}
        </p>
      </CardContent>
    </Card>
  );
}
