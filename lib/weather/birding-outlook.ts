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
export type HabitatActivityValue =
  | "较高"
  | "中等"
  | "较低"
  | "暂不可用";
export type HabitatActivityStatus = "success" | "unavailable";
export type MigrationSignalValue = "极高" | "较高" | "中等" | "较低";

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

export type BeijingTimeSummary = {
  displayText: string;
  isoTimestamp: string;
};

export type HabitatActivitySummary = {
  label: "栖息地活跃度";
  value: HabitatActivityValue;
  status: HabitatActivityStatus;
};

export type MigrationSignalSummary = {
  label: "迁徙信号";
  value: MigrationSignalValue;
};

export type ObservationConfidenceSummary = {
  label: "观测可信度";
  value: "稳定";
};

export type AnalysisOverviewSnapshot = {
  title: "栖息地环境指标";
  beijingTime: BeijingTimeSummary;
  habitatActivity: HabitatActivitySummary;
  migrationSignal: MigrationSignalSummary;
  observationConfidence: ObservationConfidenceSummary;
};

export type BirdingOutlookResponse = {
  requestStatus: BirdingRequestStatus;
  message: string;
  requestedAt: string;
  park?: ParkWeatherContext;
  weather?: DistrictWeatherSnapshot | null;
  birdingIndex?: BirdingIndexAssessment | null;
  analysisOverview?: AnalysisOverviewSnapshot | null;
};

const LOCAL_BIRDING_INDEX_MODEL_NAME = "local-weather-score-v1";

export function getBirdingModelName() {
  return LOCAL_BIRDING_INDEX_MODEL_NAME;
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
    analysisOverview: null,
  };
}

export function createSuccessResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  weather: DistrictWeatherSnapshot,
  birdingIndex: BirdingIndexAssessment,
  analysisOverview: AnalysisOverviewSnapshot,
): BirdingOutlookResponse {
  return {
    requestStatus: "success",
    message:
      "\u5929\u6c14\u4fe1\u606f\u548c\u89c2\u9e1f\u6307\u6570\u5df2\u66f4\u65b0\u3002",
    requestedAt,
    park,
    weather,
    birdingIndex,
    analysisOverview,
  };
}

export function createPartialResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  weather: DistrictWeatherSnapshot,
  birdingIndex: BirdingIndexAssessment,
  analysisOverview: AnalysisOverviewSnapshot,
): BirdingOutlookResponse {
  return {
    requestStatus: "partial",
    message:
      "\u5929\u6c14\u4fe1\u606f\u5df2\u66f4\u65b0\uff0c\u4f46\u89c2\u9e1f\u6307\u6570\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
    requestedAt,
    park,
    weather,
    birdingIndex,
    analysisOverview,
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
    analysisOverview: null,
  };
}
