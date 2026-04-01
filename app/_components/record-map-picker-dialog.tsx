"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getMissingAMapEnvVars,
  loadAMap,
  type AMapMapInstance,
  type AMapMarkerInstance,
} from "@/lib/maps/amap-loader";
import { DEFAULT_PARK } from "@/lib/maps/park-options";
import type { NotebookCoordinates } from "@/lib/records/notebook";

type RecordMapPickerDialogProps = {
  open: boolean;
  initialCoordinates: NotebookCoordinates | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (coordinates: NotebookCoordinates) => void;
};

const DEFAULT_ZOOM = 14;

function readEventCoordinates(event: unknown): NotebookCoordinates | null {
  if (!event || typeof event !== "object") {
    return null;
  }

  const lnglat = (event as { lnglat?: unknown }).lnglat;
  if (!lnglat || typeof lnglat !== "object") {
    return null;
  }

  const maybeLngLat = lnglat as {
    getLng?: () => number;
    getLat?: () => number;
    lng?: number;
    lat?: number;
  };
  const longitude =
    typeof maybeLngLat.getLng === "function"
      ? maybeLngLat.getLng()
      : maybeLngLat.lng;
  const latitude =
    typeof maybeLngLat.getLat === "function"
      ? maybeLngLat.getLat()
      : maybeLngLat.lat;

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return null;
  }

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return {
    longitude,
    latitude,
  };
}

export function RecordMapPickerDialog({
  open,
  initialCoordinates,
  onOpenChange,
  onConfirm,
}: RecordMapPickerDialogProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AMapMapInstance | null>(null);
  const markerRef = useRef<AMapMarkerInstance | null>(null);
  const clickHandlerRef = useRef<((event: unknown) => void) | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<NotebookCoordinates | null>(initialCoordinates);
  const [isMapReady, setIsMapReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const missingConfig = useMemo(() => getMissingAMapEnvVars(), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function initializeMap() {
      if (!mapContainerRef.current) {
        return;
      }

      if (missingConfig.length > 0) {
        setErrorMessage(
          `缺少地图配置：${missingConfig.join("、")}。请先补充环境变量。`,
        );
        return;
      }

      try {
        const AMap = await loadAMap();
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const initialCenter: [number, number] = initialCoordinates
          ? [initialCoordinates.longitude, initialCoordinates.latitude]
          : DEFAULT_PARK.location;

        const map = new AMap.Map(mapContainerRef.current, {
          viewMode: "3D",
          center: initialCenter,
          zoom: DEFAULT_ZOOM,
          resizeEnable: true,
          mapStyle: "amap://styles/normal",
        });
        const marker = new AMap.Marker(
          initialCoordinates
            ? {
                position: [
                  initialCoordinates.longitude,
                  initialCoordinates.latitude,
                ],
                title: "鸟点位置",
              }
            : {
                title: "鸟点位置",
              },
        );

        if (initialCoordinates) {
          map.add(marker);
        }

        const handleMapClick = (event: unknown) => {
          const coordinates = readEventCoordinates(event);
          if (!coordinates) {
            return;
          }

          marker.setPosition([coordinates.longitude, coordinates.latitude]);
          map.add(marker);
          setSelectedCoordinates(coordinates);
        };

        map.on?.("click", handleMapClick);

        mapRef.current = map;
        markerRef.current = marker;
        clickHandlerRef.current = handleMapClick;
        setIsMapReady(true);
        setErrorMessage(null);
      } catch {
        if (!cancelled) {
          setErrorMessage("地图加载失败，请检查网络或高德配置后重试。");
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;

      if (mapRef.current && clickHandlerRef.current) {
        mapRef.current.off?.("click", clickHandlerRef.current);
      }

      if (markerRef.current?.setMap) {
        markerRef.current.setMap(null);
      }

      markerRef.current = null;
      clickHandlerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [initialCoordinates, missingConfig, open]);

  const helperText = selectedCoordinates
    ? `已选择经度 ${selectedCoordinates.longitude.toFixed(6)}，纬度 ${selectedCoordinates.latitude.toFixed(6)}`
    : "轻点地图以选择鸟点位置。";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[24rem] gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 p-5 pb-3">
          <DialogTitle>地图选点</DialogTitle>
          <DialogDescription>
            轻点地图可放置或移动标记，确认后将所选位置回填到鸟点。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-5">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
            <div
              ref={mapContainerRef}
              className="h-72 w-full"
              aria-label="记录页面地图选点"
            />
            <div
              className={cn(
                "absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-base)]/85 px-4 text-center text-sm leading-6 text-[var(--text-secondary)] transition-opacity",
                isMapReady && !errorMessage
                  ? "pointer-events-none opacity-0"
                  : "opacity-100",
              )}
            >
              <p>{errorMessage ?? "地图加载中..."}</p>
            </div>
          </div>

          <p
            aria-live="polite"
            className="text-xs leading-5 text-[var(--text-secondary)]"
          >
            {helperText}
          </p>
        </div>

        <DialogFooter className="gap-2 border-t border-[var(--border-subtle)] px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-full"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!selectedCoordinates) {
                return;
              }

              onConfirm(selectedCoordinates);
              onOpenChange(false);
            }}
            disabled={!selectedCoordinates}
            className="w-full sm:w-full"
          >
            确认位置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
