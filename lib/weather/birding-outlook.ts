import type { ParkId, ParkOption } from "@/lib/maps/park-options";

export const BIRDING_INDEX_LEVELS = [
  "\u9002\u5b9c",
  "\u8f83\u9002\u5b9c",
  "\u4e0d\u9002\u5b9c",
] as const;

export type BirdingIndexLevel = (typeof BIRDING_INDEX_LEVELS)[number];
export type BirdingIndexStatus = "success" | "unavailable";
export type BirdingRequestStatus =
  | "success"
  | "partial"
  | "invalid_park"
  | "failed";
export type WeatherRawStatus = "success" | "unavailable";

export type WeatherDetail = {
  key: string;
  label: string;
  value: string;
};

export type ParkWeatherContext = {
  parkId: ParkId;
  parkName: string;
  cityName: string;
  districtName: string;
  districtCode: string;
  isDefault: boolean;
};

export type DistrictWeatherSnapshot = {
  districtName: string;
  districtCode: string;
  weatherText: string;
  temperature: string;
  humidity: string;
  windDirection: string;
  windPower: string;
  reportTime: string;
  rawStatus: WeatherRawStatus;
  rawPayload: Record<string, unknown>;
  details: WeatherDetail[];
};

export type BirdingIndexAssessment = {
  level: BirdingIndexLevel | null;
  status: BirdingIndexStatus;
  generatedAt: string | null;
  modelName: string;
  rawResult?: Record<string, unknown> | null;
  failureReason?: string | null;
};

export type BirdingOutlookResponse = {
  requestStatus: BirdingRequestStatus;
  message: string;
  requestedAt: string;
  park?: ParkWeatherContext;
  weather?: DistrictWeatherSnapshot | null;
  birdingIndex?: BirdingIndexAssessment | null;
};

export function getBirdingModelName() {
  return process.env.BIRDING_INDEX_MODEL?.trim() || "qwen3.5-plus";
}

export function isBirdingIndexLevel(
  value: unknown,
): value is BirdingIndexLevel {
  return BIRDING_INDEX_LEVELS.includes(value as BirdingIndexLevel);
}

export function createParkWeatherContext(park: ParkOption): ParkWeatherContext {
  return {
    parkId: park.id,
    parkName: park.name,
    cityName: park.city,
    districtName: park.districtName,
    districtCode: park.districtCode,
    isDefault: Boolean(park.isDefault),
  };
}

export function createUnavailableBirdingIndex(
  modelName: string,
  failureReason: string,
): BirdingIndexAssessment {
  return {
    level: null,
    status: "unavailable",
    generatedAt: null,
    modelName,
    rawResult: null,
    failureReason,
  };
}

export function createInvalidParkResponse(
  requestedAt: string,
): BirdingOutlookResponse {
  return {
    requestStatus: "invalid_park",
    message:
      "\u672a\u627e\u5230\u5bf9\u5e94\u7684\u516c\u56ed\u53c2\u6570\u3002",
    requestedAt,
  };
}

export function createSuccessResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  weather: DistrictWeatherSnapshot,
  birdingIndex: BirdingIndexAssessment,
): BirdingOutlookResponse {
  return {
    requestStatus: "success",
    message:
      "\u5929\u6c14\u4fe1\u606f\u548c\u89c2\u9e1f\u6307\u6570\u5df2\u66f4\u65b0\u3002",
    requestedAt,
    park,
    weather,
    birdingIndex,
  };
}

export function createPartialResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  weather: DistrictWeatherSnapshot,
  birdingIndex: BirdingIndexAssessment,
): BirdingOutlookResponse {
  return {
    requestStatus: "partial",
    message:
      "\u5929\u6c14\u4fe1\u606f\u5df2\u66f4\u65b0\uff0c\u4f46\u89c2\u9e1f\u6307\u6570\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
    requestedAt,
    park,
    weather,
    birdingIndex,
  };
}

export function createFailedResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  message: string,
): BirdingOutlookResponse {
  return {
    requestStatus: "failed",
    message,
    requestedAt,
    park,
    weather: null,
    birdingIndex: null,
  };
}
