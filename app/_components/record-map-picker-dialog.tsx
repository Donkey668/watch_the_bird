"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
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
  type AMapGeocoderInstance,
  type AMapLngLatInstance,
  type AMapMapInstance,
  type AMapNamespace,
} from "@/lib/maps/amap-loader";
import { DEFAULT_PARK } from "@/lib/maps/park-options";
import type { NotebookCoordinates } from "@/lib/records/notebook";

export type RecordMapPickerResult = {
  coordinates: NotebookCoordinates;
  label: string;
  usedFallbackLabel: boolean;
};

type RecordMapPickerDialogProps = {
  open: boolean;
  initialCoordinates: NotebookCoordinates | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: RecordMapPickerResult) => void;
};

const DEFAULT_ZOOM = 15;
const DEFAULT_COORDINATES: NotebookCoordinates = {
  longitude: DEFAULT_PARK.location[0],
  latitude: DEFAULT_PARK.location[1],
};

function readLngLat(
  lngLat: AMapLngLatInstance | NotebookCoordinates | null | undefined,
) {
  if (!lngLat || typeof lngLat !== "object") {
    return null;
  }

  const maybeLng =
    "getLng" in lngLat && typeof lngLat.getLng === "function"
      ? lngLat.getLng()
      : "longitude" in lngLat
        ? lngLat.longitude
        : lngLat.lng;
  const maybeLat =
    "getLat" in lngLat && typeof lngLat.getLat === "function"
      ? lngLat.getLat()
      : "latitude" in lngLat
        ? lngLat.latitude
        : lngLat.lat;

  if (
    typeof maybeLng !== "number" ||
    typeof maybeLat !== "number" ||
    !Number.isFinite(maybeLng) ||
    !Number.isFinite(maybeLat)
  ) {
    return null;
  }

  return {
    longitude: maybeLng,
    latitude: maybeLat,
  } satisfies NotebookCoordinates;
}

function formatCoordinateFallbackLabel(coordinates: NotebookCoordinates) {
  return `经度 ${coordinates.longitude.toFixed(6)}，纬度 ${coordinates.latitude.toFixed(6)}`;
}

function normalizeAddressLabel(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function pickAddressLabel(result: unknown) {
  if (!result || typeof result !== "object") {
    return "";
  }

  const formattedAddress = normalizeAddressLabel(
    (result as { regeocode?: { formattedAddress?: unknown } }).regeocode
      ?.formattedAddress,
  );
  if (formattedAddress) {
    return formattedAddress;
  }

  const nearestPoi = (result as { regeocode?: { pois?: Array<{ name?: unknown }> } })
    .regeocode?.pois?.[0];
  const poiName = normalizeAddressLabel(nearestPoi?.name);
  if (poiName) {
    return poiName;
  }

  return "";
}

function waitForMapContainer(
  containerRef: RefObject<HTMLDivElement | null>,
  attempt = 0,
): Promise<HTMLDivElement> {
  const container = containerRef.current;
  if (container && container.clientWidth > 0 && container.clientHeight > 0) {
    return Promise.resolve(container);
  }

  if (attempt >= 30) {
    return Promise.reject(new Error("地图容器尚未完成渲染。"));
  }

  return new Promise((resolve, reject) => {
    window.requestAnimationFrame(() => {
      void waitForMapContainer(containerRef, attempt + 1).then(resolve, reject);
    });
  });
}

async function reverseGeocodeWithAMap(
  AMap: AMapNamespace,
  coordinates: NotebookCoordinates,
) {
  return new Promise<{ label: string; usedFallbackLabel: boolean }>(
    (resolve, reject) => {
      let geocoder: AMapGeocoderInstance;

      try {
        geocoder = new AMap.Geocoder({});
      } catch (error) {
        reject(error);
        return;
      }

      geocoder.getAddress(
        [coordinates.longitude, coordinates.latitude],
        (status, result) => {
          if (status !== "complete") {
            reject(new Error("逆地理编码失败。"));
            return;
          }

          const label = pickAddressLabel(result);
          if (label) {
            resolve({
              label,
              usedFallbackLabel: false,
            });
            return;
          }

          resolve({
            label: formatCoordinateFallbackLabel(coordinates),
            usedFallbackLabel: true,
          });
        },
      );
    },
  );
}

function MapPinIndicator() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="relative -translate-y-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-emerald-600 shadow-[0_14px_30px_-16px_rgba(5,150,105,0.9)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
        </div>
        <div className="absolute left-1/2 top-[2.5rem] h-4 w-4 -translate-x-1/2 rotate-45 rounded-[0.35rem] bg-emerald-600 shadow-[0_10px_20px_-16px_rgba(5,150,105,0.9)]" />
        <div className="absolute left-1/2 top-[3.25rem] h-3 w-3 -translate-x-1/2 rounded-full bg-black/15 blur-[1px]" />
      </div>
    </div>
  );
}

export function RecordMapPickerDialog({
  open,
  initialCoordinates,
  onOpenChange,
  onConfirm,
}: RecordMapPickerDialogProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AMapMapInstance | null>(null);
  const moveHandlerRef = useRef<(() => void) | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<NotebookCoordinates | null>(initialCoordinates ?? DEFAULT_COORDINATES);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [mapLoadErrorMessage, setMapLoadErrorMessage] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const missingConfig = useMemo(() => getMissingAMapEnvVars(), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const initialSelection = initialCoordinates ?? DEFAULT_COORDINATES;

    setSelectedCoordinates(initialSelection);
    setIsMapReady(false);
    setIsConfirming(false);
    setMapLoadErrorMessage(null);
    setStatusMessage(null);

    async function initializeMap() {
      if (missingConfig.length > 0) {
        setMapLoadErrorMessage(
          `缺少地图配置：${missingConfig.join("、")}。请先补全环境变量。`,
        );
        return;
      }

      try {
        const [container, AMap] = await Promise.all([
          waitForMapContainer(mapContainerRef),
          loadAMap(),
        ]);
        if (cancelled) {
          return;
        }

        const map = new AMap.Map(container, {
          viewMode: "3D",
          center: [initialSelection.longitude, initialSelection.latitude],
          zoom: DEFAULT_ZOOM,
          resizeEnable: true,
          mapStyle: "amap://styles/normal",
          dragEnable: true,
        });

        const syncSelectedCoordinates = () => {
          const coordinates = readLngLat(map.getCenter?.());
          if (coordinates) {
            setSelectedCoordinates(coordinates);
            setStatusMessage(null);
          }
        };

        map.on?.("moveend", syncSelectedCoordinates);
        map.on?.("zoomend", syncSelectedCoordinates);

        mapRef.current = map;
        moveHandlerRef.current = syncSelectedCoordinates;
        syncSelectedCoordinates();
        setIsMapReady(true);
      } catch {
        if (!cancelled) {
          setMapLoadErrorMessage("地图加载失败，请检查网络和高德配置后重试。");
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;

      if (mapRef.current && moveHandlerRef.current) {
        mapRef.current.off?.("moveend", moveHandlerRef.current);
        mapRef.current.off?.("zoomend", moveHandlerRef.current);
      }

      moveHandlerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
      setIsMapReady(false);
      setIsConfirming(false);
    };
  }, [initialCoordinates, missingConfig, open]);

  const helperText =
    statusMessage ??
    (selectedCoordinates
      ? `当前选点：经度 ${selectedCoordinates.longitude.toFixed(6)}，纬度 ${selectedCoordinates.latitude.toFixed(6)}`
      : "拖动地图，将中心选点图标对准目标位置。");

  async function handleConfirm() {
    if (!selectedCoordinates || isConfirming) {
      return;
    }

    setIsConfirming(true);
    setStatusMessage(null);

    try {
      const AMap = await loadAMap();
      const geocodeResult = await reverseGeocodeWithAMap(AMap, selectedCoordinates);

      onConfirm({
        coordinates: selectedCoordinates,
        label: geocodeResult.label,
        usedFallbackLabel: geocodeResult.usedFallbackLabel,
      });
      onOpenChange(false);
    } catch {
      setStatusMessage("地址解析失败，请稍后重试。");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[24rem] gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 p-5 pb-3">
          <DialogTitle>地图选点</DialogTitle>
          <DialogDescription>
            拖动地图，让中心图钉对准目标位置；确认后将自动解析地址并回填到鸟点。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-5">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
            <div
              ref={mapContainerRef}
              className="h-72 w-full"
              aria-label="记录页面地图选点"
            />
            <MapPinIndicator />
            <div
              className={cn(
                "absolute inset-0 z-20 flex items-center justify-center bg-[var(--surface-base)]/88 px-4 text-center text-sm leading-6 text-[var(--text-secondary)] transition-opacity",
                isMapReady && !mapLoadErrorMessage
                  ? "pointer-events-none opacity-0"
                  : "opacity-100",
              )}
            >
              <p>{mapLoadErrorMessage ?? "地图加载中..."}</p>
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
            disabled={isConfirming}
            className="w-full sm:w-full"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={!selectedCoordinates || !isMapReady || isConfirming}
            className="w-full sm:w-full"
          >
            {isConfirming ? "解析中..." : "确认位置"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
