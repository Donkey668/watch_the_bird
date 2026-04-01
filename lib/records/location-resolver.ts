import "server-only";

import {
  validateNotebookCoordinates,
  type NotebookCoordinates,
} from "./notebook";

const RESOLVED_LOCATION_SOURCES = ["device", "map"] as const;

export type ResolvedLocationSource = (typeof RESOLVED_LOCATION_SOURCES)[number];

export type ResolvedBirdPoint = {
  label: string;
  coordinates: NotebookCoordinates;
  source: ResolvedLocationSource;
  usedFallbackLabel: boolean;
};

type ResolveLocationResult =
  | {
      ok: true;
      location: ResolvedBirdPoint;
    }
  | {
      ok: false;
      message: string;
    };

type AMapReverseGeocodeResponse = {
  status?: string;
  regeocode?: {
    formatted_address?: string;
    addressComponent?: {
      district?: string;
      township?: string;
      neighborhood?: {
        name?: string;
      };
      building?: {
        name?: string;
      };
    };
    pois?: Array<{
      name?: string;
    }>;
  };
};

function isResolvedLocationSource(value: unknown): value is ResolvedLocationSource {
  return (
    typeof value === "string" &&
    RESOLVED_LOCATION_SOURCES.includes(value as ResolvedLocationSource)
  );
}

function normalizeLocationLabel(label: string) {
  return label.replace(/\s+/g, "").trim();
}

function getReverseGeocodeApiKey() {
  return (
    process.env.AMAP_WEATHER_KEY?.trim() ||
    process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ||
    ""
  );
}

async function requestReverseGeocode(
  coordinates: NotebookCoordinates,
): Promise<string | null> {
  const apiKey = getReverseGeocodeApiKey();
  if (!apiKey) {
    return null;
  }

  const query = new URLSearchParams({
    key: apiKey,
    location: `${coordinates.longitude},${coordinates.latitude}`,
    extensions: "base",
    radius: "1000",
    roadlevel: "0",
  });

  const response = await fetch(
    `https://restapi.amap.com/v3/geocode/regeo?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AMapReverseGeocodeResponse;
  if (payload.status !== "1" || !payload.regeocode) {
    return null;
  }

  const formattedAddress = normalizeLocationLabel(
    payload.regeocode.formatted_address ?? "",
  );
  if (formattedAddress) {
    return formattedAddress;
  }

  const candidates = [
    payload.regeocode.pois?.[0]?.name,
    payload.regeocode.addressComponent?.building?.name,
    payload.regeocode.addressComponent?.neighborhood?.name,
    payload.regeocode.addressComponent?.township,
    payload.regeocode.addressComponent?.district,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeLocationLabel(candidate ?? "");
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function formatCoordinateFallbackLabel(coordinates: NotebookCoordinates) {
  return `经度 ${coordinates.longitude.toFixed(6)}，纬度 ${coordinates.latitude.toFixed(6)}`;
}

export async function resolveBirdPointFromCoordinates({
  longitude,
  latitude,
  source,
}: {
  longitude: unknown;
  latitude: unknown;
  source: unknown;
}): Promise<ResolveLocationResult> {
  if (!isResolvedLocationSource(source)) {
    return {
      ok: false,
      message: "定位参数无效，请重新选择位置。",
    };
  }

  const coordinateResult = validateNotebookCoordinates({
    longitude:
      typeof longitude === "string" ? Number.parseFloat(longitude) : longitude,
    latitude:
      typeof latitude === "string" ? Number.parseFloat(latitude) : latitude,
  });

  if (!coordinateResult.ok || coordinateResult.coordinates === null) {
    return {
      ok: false,
      message: "定位参数无效，请重新选择位置。",
    };
  }

  const coordinates = coordinateResult.coordinates;
  let label: string | null = null;

  try {
    label = await requestReverseGeocode(coordinates);
  } catch {
    label = null;
  }

  return {
    ok: true,
    location: {
      label: label ?? formatCoordinateFallbackLabel(coordinates),
      coordinates,
      source,
      usedFallbackLabel: label === null,
    },
  };
}
