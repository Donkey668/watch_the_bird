import "server-only";

import { getBeijingTimeContext } from "@/lib/time/beijing-time";
import type { ParkWeatherContext } from "@/lib/weather/birding-outlook";

const HOURLY_FORECAST_ENDPOINT =
  "https://opendata.sz.gov.cn/api/339779363/1/service.xhtml";
const DISTRICT_FORECAST_ENDPOINT =
  "https://opendata.sz.gov.cn/api/1964883385/1/service.xhtml";
const SUN_MOON_TIMING_ENDPOINT =
  "https://opendata.sz.gov.cn/api/1214604037/1/service.xhtml";
const DISASTER_WARNING_ENDPOINT =
  "https://opendata.sz.gov.cn/api/589826359/1/service.xhtml";

const MAX_ROWS_PER_REQUEST = 10000;
const DEFAULT_HOURLY_ROWS = 1000;
const DEFAULT_DISTRICT_ROWS = 160;
const DEFAULT_SUN_MOON_ROWS = 80;
const DEFAULT_WARNING_ROWS = 200;
const SUN_TIMING_ATTRIB_NAMES = new Set(["日出", "日落"]);
const AMAP_DISTRICT_CODE_NAME_MAP: Record<string, string[]> = {
  "440303": ["罗湖区"],
  "440304": ["福田区"],
  "440305": ["南山区"],
  "440306": ["宝安区"],
  "440307": ["龙岗区"],
  "440308": ["盐田区"],
  "440309": ["龙华区"],
  "440310": ["坪山区"],
  "440311": ["光明区"],
  "440312": ["大鹏新区"],
  "440387": ["深汕特别合作区", "深汕合作区"],
};

const FORECAST_WARNING_FAILURE_MESSAGE =
  "预报预警服务暂时不可用，请稍后重试。";

type UpstreamRecord = Record<string, unknown>;
type UpstreamQueryOptions = {
  page?: number;
  rows?: number;
  startDate?: string | null;
  endDate?: string | null;
};

export type ForecastWarningRequestStatus =
  | "success"
  | "partial"
  | "invalid_park"
  | "failed";

export type ForecastWarningModuleStatus = "success" | "empty" | "failed";

export type ForecastWarningParkContext = {
  parkId: string;
  parkName: string;
  districtName: string;
  districtCode: string;
};

export type ForecastWarningModule<T> = {
  status: ForecastWarningModuleStatus;
  message: string;
  source: string;
  returnedCount: number;
  records: T[];
};

export type HourlyForecastRecord = {
  recId: string;
  forecastTime: string;
  weatherStatus: string;
  qpfTemp: string;
};

export type DistrictForecastRecord = {
  recId: string;
  forecastTime: string;
  weatherStatus: string;
  minTemperature: string;
  maxTemperature: string;
};

export type SunMoonTimingRecord = {
  keyId: string;
  forecastTime: string;
  attribName: string;
  attribValue: string;
};

export type DisasterWarningRecord = {
  sequence: number;
  issueTime: string;
  signalType: string;
  signalLevel: string;
  issueContent: string;
  district: string;
  textColorToken: string;
  isPlaceholder: boolean;
};

export type ForecastWarningModules = {
  hourlyForecast: ForecastWarningModule<HourlyForecastRecord>;
  districtForecast: ForecastWarningModule<DistrictForecastRecord>;
  sunMoonTiming: ForecastWarningModule<SunMoonTimingRecord>;
  disasterWarning: ForecastWarningModule<DisasterWarningRecord>;
};

export type ForecastWarningResponse = {
  requestStatus: ForecastWarningRequestStatus;
  message: string;
  requestedAt: string;
  park: ForecastWarningParkContext | null;
  hourlyForecast: ForecastWarningModule<HourlyForecastRecord> | null;
  districtForecast: ForecastWarningModule<DistrictForecastRecord> | null;
  sunMoonTiming: ForecastWarningModule<SunMoonTimingRecord> | null;
  disasterWarning: ForecastWarningModule<DisasterWarningRecord> | null;
};

type WarningEvent = {
  key: string;
  sourceIndex: number;
  issueTime: string;
  issueDate: Date;
  issueState: string;
  signalType: string;
  signalLevel: string;
  issueContent: string;
  district: string;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function normalizePage(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizeRows(value: number | undefined, fallback: number) {
  const resolved =
    value && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;

  return Math.min(resolved, MAX_ROWS_PER_REQUEST);
}

function toForecastWarningParkContext(
  park: ParkWeatherContext,
): ForecastWarningParkContext {
  return {
    parkId: park.parkId,
    parkName: park.parkName,
    districtName: park.districtName,
    districtCode: park.districtCode,
  };
}

function getForecastWarningAppKey() {
  const appKey = process.env.SZ_WEATHER_APP_KEY?.trim();
  if (!appKey) {
    throw new Error("缺少预报预警服务 appKey 配置。");
  }

  return appKey;
}

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function createDateInBeijing(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
) {
  const timestamp = Date.parse(
    `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+08:00`,
  );

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

function parseDateFromText(value: string) {
  const raw = readText(value);
  if (!raw) {
    return null;
  }

  if (/^\d{14}$/.test(raw)) {
    const year = Number.parseInt(raw.slice(0, 4), 10);
    const month = Number.parseInt(raw.slice(4, 6), 10);
    const day = Number.parseInt(raw.slice(6, 8), 10);
    const hour = Number.parseInt(raw.slice(8, 10), 10);
    const minute = Number.parseInt(raw.slice(10, 12), 10);
    const second = Number.parseInt(raw.slice(12, 14), 10);
    return createDateInBeijing(year, month, day, hour, minute, second);
  }

  if (/^\d{12}$/.test(raw)) {
    const year = Number.parseInt(raw.slice(0, 4), 10);
    const month = Number.parseInt(raw.slice(4, 6), 10);
    const day = Number.parseInt(raw.slice(6, 8), 10);
    const hour = Number.parseInt(raw.slice(8, 10), 10);
    const minute = Number.parseInt(raw.slice(10, 12), 10);
    return createDateInBeijing(year, month, day, hour, minute, 0);
  }

  if (/^\d{8}$/.test(raw)) {
    const year = Number.parseInt(raw.slice(0, 4), 10);
    const month = Number.parseInt(raw.slice(4, 6), 10);
    const day = Number.parseInt(raw.slice(6, 8), 10);
    return createDateInBeijing(year, month, day);
  }

  const normalized = raw.replace(/\//g, "-");
  const parts = normalized.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
  );

  if (parts) {
    const year = Number.parseInt(parts[1], 10);
    const month = Number.parseInt(parts[2], 10);
    const day = Number.parseInt(parts[3], 10);
    const hour = Number.parseInt(parts[4] ?? "0", 10);
    const minute = Number.parseInt(parts[5] ?? "0", 10);
    const second = Number.parseInt(parts[6] ?? "0", 10);
    return createDateInBeijing(year, month, day, hour, minute, second);
  }

  const fallbackTimestamp = Date.parse(raw);
  if (Number.isNaN(fallbackTimestamp)) {
    return null;
  }

  return new Date(fallbackTimestamp);
}

function getBeijingDateToken(date = new Date()) {
  return getBeijingTimeContext(date).isoTimestamp.slice(0, 10).replace(/-/g, "");
}

function getBeijingDateText(date = new Date()) {
  return getBeijingTimeContext(date).isoTimestamp.slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getBeijingPreviousHourStart(now: Date) {
  const beijingNow = getBeijingTimeContext(now).isoTimestamp;
  const datePart = beijingNow.slice(0, 10);
  const hourText = beijingNow.slice(11, 13);
  const [yearText, monthText, dayText] = datePart.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const month = Number.parseInt(monthText ?? "", 10);
  const day = Number.parseInt(dayText ?? "", 10);
  const hour = Number.parseInt(hourText, 10);

  const hourStart = createDateInBeijing(year, month, day, hour, 0, 0);
  if (!hourStart) {
    return new Date(now.getTime() - 60 * 60 * 1000);
  }

  return new Date(hourStart.getTime() - 60 * 60 * 1000);
}

function isRecord(value: unknown): value is UpstreamRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecordArray(value: unknown): value is UpstreamRecord[] {
  return Array.isArray(value) && value.every(isRecord);
}

function findFirstRecordArray(value: unknown, depth = 0): UpstreamRecord[] | null {
  if (depth > 6) {
    return null;
  }

  if (isRecordArray(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findFirstRecordArray(item, depth + 1);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (isRecord(value)) {
    for (const nestedValue of Object.values(value)) {
      const nested = findFirstRecordArray(nestedValue, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function readRowText(row: UpstreamRecord, ...keys: string[]) {
  for (const key of keys) {
    if (key in row) {
      const text = readText(row[key]);
      if (text) {
        return text;
      }
    }

    const matchedKey = Object.keys(row).find(
      (rowKey) => rowKey.toLowerCase() === key.toLowerCase(),
    );
    if (matchedKey) {
      const text = readText(row[matchedKey]);
      if (text) {
        return text;
      }
    }
  }

  return "";
}

function normalizeDistrictKey(value: string) {
  return readText(value)
    .replace(/\s+/g, "")
    .replace(/^深圳市/, "")
    .replace(/特别合作区$/g, "合作区")
    .replace(/(合作区|新区|市|区|县)$/g, "");
}

function resolveParkDistrictKeys(park: ForecastWarningParkContext) {
  const resolvedNames = [
    park.districtName,
    ...(AMAP_DISTRICT_CODE_NAME_MAP[park.districtCode] ?? []),
  ];

  return new Set(
    resolvedNames
      .map((name) => normalizeDistrictKey(name))
      .filter((name) => Boolean(name)),
  );
}

function isDistrictMatch(areaValue: string, park: ForecastWarningParkContext) {
  const rawArea = readText(areaValue);
  if (!rawArea) {
    return false;
  }

  const areaKey = normalizeDistrictKey(rawArea);
  if (!areaKey) {
    return false;
  }

  const districtKeys = resolveParkDistrictKeys(park);
  if (districtKeys.size === 0) {
    return false;
  }

  return districtKeys.has(areaKey);
}

function dedupeForecastByTime<T extends { forecastTime: string }>(
  items: Array<{
    sortTime: number;
    reviseTime: number;
    record: T;
  }>,
) {
  const deduped = new Map<string, typeof items[number]>();

  for (const item of items) {
    const key = item.record.forecastTime;
    const current = deduped.get(key);
    if (!current || item.reviseTime > current.reviseTime) {
      deduped.set(key, item);
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => a.sortTime - b.sortTime)
    .map((item) => item.record);
}

function resolveWarningColor(signalType: string, signalLevel: string) {
  if (!signalType && !signalLevel) {
    return "text-gray-400";
  }

  if (signalType && !signalLevel) {
    return "text-yellow-600";
  }

  if (signalLevel.includes("红")) {
    return "text-red-600";
  }

  if (signalLevel.includes("橙")) {
    return "text-orange-500";
  }

  if (signalLevel.includes("黄")) {
    return "text-yellow-600";
  }

  if (signalLevel.includes("蓝")) {
    return "text-blue-600";
  }

  if (signalLevel.includes("白")) {
    return "text-slate-500";
  }

  return "text-[var(--text-primary)]";
}

function buildOpenDataUrl(
  endpoint: string,
  defaultRows: number,
  options: UpstreamQueryOptions = {},
) {
  const url = new URL(endpoint);
  url.searchParams.set("appKey", getForecastWarningAppKey());
  url.searchParams.set("page", normalizePage(options.page).toString());
  url.searchParams.set(
    "rows",
    normalizeRows(options.rows, defaultRows).toString(),
  );

  if (options.startDate) {
    url.searchParams.set("startDate", options.startDate);
  }

  if (options.endDate) {
    url.searchParams.set("endDate", options.endDate);
  }

  return url.toString();
}

export function buildHourlyForecastUrl(options: UpstreamQueryOptions = {}) {
  return buildOpenDataUrl(HOURLY_FORECAST_ENDPOINT, DEFAULT_HOURLY_ROWS, options);
}

export function buildDistrictForecastUrl(options: UpstreamQueryOptions = {}) {
  return buildOpenDataUrl(
    DISTRICT_FORECAST_ENDPOINT,
    DEFAULT_DISTRICT_ROWS,
    options,
  );
}

export function buildSunMoonTimingUrl(options: UpstreamQueryOptions = {}) {
  return buildOpenDataUrl(
    SUN_MOON_TIMING_ENDPOINT,
    DEFAULT_SUN_MOON_ROWS,
    options,
  );
}

export function buildDisasterWarningUrl(options: UpstreamQueryOptions = {}) {
  return buildOpenDataUrl(
    DISASTER_WARNING_ENDPOINT,
    DEFAULT_WARNING_ROWS,
    options,
  );
}

async function fetchUpstreamRows(
  url: string,
  messageOnFailure: string,
): Promise<
  | { ok: true; rows: UpstreamRecord[] }
  | {
      ok: false;
      message: string;
    }
> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: messageOnFailure,
      };
    }

    const payload = (await response.json()) as unknown;
    const rows = findFirstRecordArray(payload);
    if (!rows) {
      return {
        ok: false,
        message: messageOnFailure,
      };
    }

    return {
      ok: true,
      rows,
    };
  } catch {
    return {
      ok: false,
      message: messageOnFailure,
    };
  }
}

function createModuleFailed<T>(
  source: string,
  message: string,
): ForecastWarningModule<T> {
  return {
    status: "failed",
    message,
    source,
    returnedCount: 0,
    records: [],
  };
}

function createModuleEmpty<T>(
  source: string,
  message: string,
): ForecastWarningModule<T> {
  return {
    status: "empty",
    message,
    source,
    returnedCount: 0,
    records: [],
  };
}

function normalizeHourlyForecastRows(
  rows: UpstreamRecord[],
  park: ForecastWarningParkContext,
  now: Date,
) {
  const previousHourStart = getBeijingPreviousHourStart(now);
  const normalized = rows
    .map((row) => {
      const areaName = readRowText(row, "AREANAME", "DISTRICT");
      if (!isDistrictMatch(areaName, park)) {
        return null;
      }

      const displayTime = readRowText(row, "FORECASTTIME");
      const forecastDate = parseDateFromText(displayTime);
      const reviseDate = parseDateFromText(
        readRowText(row, "WRITETIME", "CRTTIME"),
      );
      if (
        !displayTime ||
        !forecastDate ||
        forecastDate.getTime() <= previousHourStart.getTime()
      ) {
        return null;
      }

      return {
        sortTime: forecastDate.getTime(),
        reviseTime: reviseDate?.getTime() ?? 0,
        record: {
          recId: readRowText(row, "RECID", "KEYID") || "N/A",
          forecastTime: displayTime,
          weatherStatus:
            readRowText(row, "WEATHERSTATUS", "QPFWEATHERSTATUS") || "暂无",
          qpfTemp: readRowText(row, "QPFTEMP", "TEMPERATURE") || "暂无",
        } satisfies HourlyForecastRecord,
      };
    })
    .filter(
      (
        item,
      ): item is {
        sortTime: number;
        reviseTime: number;
        record: HourlyForecastRecord;
      } =>
        item !== null,
    );

  return dedupeForecastByTime(normalized);
}

function normalizeDistrictForecastRows(
  rows: UpstreamRecord[],
  now: Date,
) {
  const todayToken = getBeijingDateToken(now);
  const normalized = rows
    .map((row) => {
      const forecastDateTextRaw = readRowText(row, "FORECASTDATE");
      const forecastDate = parseDateFromText(forecastDateTextRaw);
      if (!forecastDateTextRaw || !forecastDate) {
        return null;
      }

      const forecastDateText = getBeijingDateText(forecastDate);
      const forecastDateToken = forecastDateText.replace(/-/g, "");
      if (forecastDateToken < todayToken) {
        return null;
      }

      const reviseDate = parseDateFromText(
        readRowText(row, "WRITETIME", "CRTTIME"),
      );

      return {
        sortTime: forecastDate.getTime(),
        reviseTime: reviseDate?.getTime() ?? 0,
        record: {
          recId: readRowText(row, "RECID", "KEYID") || "N/A",
          forecastTime: forecastDateText,
          weatherStatus:
            readRowText(row, "WEATH", "WEATHERSTATUS") || "暂无",
          minTemperature: readRowText(row, "MINTEMP", "MINTEMPERATURE") || "暂无",
          maxTemperature: readRowText(row, "MAXTEMP", "MAXTEMPERATURE") || "暂无",
        } satisfies DistrictForecastRecord,
      };
    })
    .filter(
      (
        item,
      ): item is {
        sortTime: number;
        reviseTime: number;
        record: DistrictForecastRecord;
      } =>
        item !== null,
    );

  return dedupeForecastByTime(normalized);
}

function normalizeSunMoonTimingRows(
  rows: UpstreamRecord[],
  now: Date,
) {
  const todayToken = getBeijingDateToken(now);
  const normalized = rows
    .map((row) => {
      const forecastTime = readRowText(row, "DDATETIME");
      const forecastDate = parseDateFromText(forecastTime);
      const attribName = readRowText(row, "ATTRIBNAME");
      const attribValue = readRowText(row, "ATTRIBVALUE");
      if (!forecastDate || !attribName || !attribValue) {
        return null;
      }

      if (!SUN_TIMING_ATTRIB_NAMES.has(attribName)) {
        return null;
      }

      if (getBeijingDateToken(forecastDate) !== todayToken) {
        return null;
      }

      return {
        sortTime: forecastDate.getTime(),
        record: {
          keyId: readRowText(row, "KEYID", "REC", "RECID") || "N/A",
          forecastTime: forecastTime || getBeijingTimeContext(forecastDate).displayText,
          attribName,
          attribValue,
        } satisfies SunMoonTimingRecord,
      };
    })
    .filter(
      (item): item is { sortTime: number; record: SunMoonTimingRecord } =>
        item !== null,
    )
    .sort((a, b) => a.sortTime - b.sortTime);

  return normalized.map((item) => item.record);
}

function normalizeWarningEvents(
  rows: UpstreamRecord[],
  park: ForecastWarningParkContext,
  now: Date,
) {
  return rows
    .map((row, sourceIndex) => {
      const issueTime = readRowText(row, "ISSUETIME", "DDATETIME");
      const issueDate = parseDateFromText(issueTime);
      if (!issueDate) {
        return null;
      }

      if (issueDate.getTime() > now.getTime()) {
        return null;
      }

      const district = readRowText(row, "DISTRICT", "AREANAME");
      if (!isDistrictMatch(district, park)) {
        return null;
      }

      const signalType = readRowText(row, "SIGNALTYPE");
      const signalLevel = readRowText(row, "SIGNALLEVEL");
      const issueState = readRowText(row, "ISSUESTATE");
      const key =
        readRowText(row, "TNUMBER") ||
        `${signalType}|${signalLevel}|${district || park.districtName}`;

      return {
        key,
        sourceIndex,
        issueTime,
        issueDate,
        issueState,
        signalType,
        signalLevel,
        issueContent: readRowText(row, "ISSUECONTENT"),
        district: district || park.districtName,
      } satisfies WarningEvent;
    })
    .filter((item): item is WarningEvent => item !== null);
}

function normalizeDisasterWarningRows(
  rows: UpstreamRecord[],
  park: ForecastWarningParkContext,
  now: Date,
) {
  const events = normalizeWarningEvents(rows, park, now);
  const activeMap = new Map<string, WarningEvent>();
  const chronologicalEvents = [...events].sort((a, b) => {
    const byIssueTime = a.issueDate.getTime() - b.issueDate.getTime();
    if (byIssueTime !== 0) {
      return byIssueTime;
    }

    return a.sourceIndex - b.sourceIndex;
  });

  for (const event of chronologicalEvents) {
    const issueState = event.issueState;
    if (issueState.includes("取消")) {
      activeMap.delete(event.key);
      continue;
    }

    if (issueState.includes("发布") || !issueState) {
      activeMap.set(event.key, event);
    }
  }

  const activeEvents = events.filter((event) => {
    const activeEvent = activeMap.get(event.key);
    return Boolean(activeEvent && activeEvent.sourceIndex === event.sourceIndex);
  });
  const renderableEvents = activeEvents.filter(
    (event) => event.signalType || event.signalLevel,
  );

  if (renderableEvents.length === 0) {
    return [
      {
        sequence: 1,
        issueTime: "",
        signalType: "",
        signalLevel: "",
        issueContent: "",
        district: "",
        textColorToken: "text-gray-400",
        isPlaceholder: true,
      } satisfies DisasterWarningRecord,
    ];
  }

  return renderableEvents.map((event, index) => ({
    sequence: index + 1,
    issueTime: event.issueTime,
    signalType: event.signalType,
    signalLevel: event.signalLevel,
    issueContent: event.issueContent,
    district: event.district,
    textColorToken: resolveWarningColor(event.signalType, event.signalLevel),
    isPlaceholder: false,
  }));
}

async function loadHourlyForecastModule(
  park: ForecastWarningParkContext,
  now: Date,
): Promise<ForecastWarningModule<HourlyForecastRecord>> {
  const startDate = getBeijingDateToken(addDays(now, -1));
  const endDate = getBeijingDateToken(addDays(now, 2));
  const upstream = await fetchUpstreamRows(
    buildHourlyForecastUrl({
      page: 1,
      rows: DEFAULT_HOURLY_ROWS,
      startDate,
      endDate,
    }),
    "分区逐时预报暂时不可用，请稍后重试。",
  );

  if (!upstream.ok) {
    return createModuleFailed("339779363", upstream.message);
  }

  const records = normalizeHourlyForecastRows(upstream.rows, park, now);
  if (records.length === 0) {
    return createModuleEmpty("339779363", "当前暂无可展示的分区逐时预报。");
  }

  return {
    status: "success",
    message: "已加载分区逐时预报。",
    source: "339779363",
    returnedCount: records.length,
    records,
  };
}

async function loadDistrictForecastModule(
  park: ForecastWarningParkContext,
  now: Date,
): Promise<ForecastWarningModule<DistrictForecastRecord>> {
  const startDate = getBeijingDateToken(addDays(now, -12));
  const endDate = getBeijingDateToken(now);
  const [upstreamPage1, upstreamPage2] = await Promise.all([
    fetchUpstreamRows(
      buildDistrictForecastUrl({
        page: 1,
        rows: DEFAULT_DISTRICT_ROWS,
        startDate,
        endDate,
      }),
      "分区预报暂时不可用，请稍后重试。",
    ),
    fetchUpstreamRows(
      buildDistrictForecastUrl({
        page: 2,
        rows: DEFAULT_DISTRICT_ROWS,
        startDate,
        endDate,
      }),
      "分区预报暂时不可用，请稍后重试。",
    ),
  ]);

  const upstreamRows: UpstreamRecord[] = [];
  if (upstreamPage1.ok) {
    upstreamRows.push(...upstreamPage1.rows);
  }
  if (upstreamPage2.ok) {
    upstreamRows.push(...upstreamPage2.rows);
  }

  if (upstreamRows.length === 0) {
    const failedMessage = !upstreamPage1.ok
      ? upstreamPage1.message
      : !upstreamPage2.ok
        ? upstreamPage2.message
        : "分区预报暂时不可用，请稍后重试。";
    return createModuleFailed(
      "1964883385",
      failedMessage,
    );
  }

  const records = normalizeDistrictForecastRows(upstreamRows, now);
  if (records.length === 0) {
    return createModuleEmpty("1964883385", "当前暂无可展示的分区预报。");
  }

  return {
    status: "success",
    message: "已加载分区预报。",
    source: "1964883385",
    returnedCount: records.length,
    records,
  };
}

async function loadSunMoonTimingModule(
  now: Date,
): Promise<ForecastWarningModule<SunMoonTimingRecord>> {
  const today = getBeijingDateToken(now);
  const startDate = getBeijingDateToken(addDays(now, -1));
  const upstream = await fetchUpstreamRows(
    buildSunMoonTimingUrl({
      page: 1,
      rows: DEFAULT_SUN_MOON_ROWS,
      startDate,
      endDate: today,
    }),
    "日月时刻暂时不可用，请稍后重试。",
  );

  if (!upstream.ok) {
    return createModuleFailed("1214604037", upstream.message);
  }

  const records = normalizeSunMoonTimingRows(upstream.rows, now);
  if (records.length === 0) {
    return createModuleEmpty("1214604037", "今天暂无可展示的日月时刻数据。");
  }

  return {
    status: "success",
    message: "已加载日月时刻。",
    source: "1214604037",
    returnedCount: records.length,
    records,
  };
}

async function loadDisasterWarningModule(
  park: ForecastWarningParkContext,
  now: Date,
): Promise<ForecastWarningModule<DisasterWarningRecord>> {
  const startDate = getBeijingDateToken(addDays(now, -2));
  const endDate = getBeijingDateToken(addDays(now, 2));
  const upstream = await fetchUpstreamRows(
    buildDisasterWarningUrl({
      page: 1,
      rows: DEFAULT_WARNING_ROWS,
      startDate,
      endDate,
    }),
    "灾害预警暂时不可用，请稍后重试。",
  );

  if (!upstream.ok) {
    return createModuleFailed("589826359", upstream.message);
  }

  const records = normalizeDisasterWarningRows(upstream.rows, park, now);
  if (records.length === 0) {
    return createModuleEmpty("589826359", "当前无生效信号。");
  }

  const hasOnlyPlaceholder = records.length === 1 && records[0]?.isPlaceholder;

  return {
    status: "success",
    message: hasOnlyPlaceholder ? "当前无生效信号。" : "已加载灾害预警。",
    source: "589826359",
    returnedCount: records.length,
    records,
  };
}

export async function fetchForecastWarningModules(
  park: ParkWeatherContext,
  now = new Date(),
): Promise<ForecastWarningModules> {
  const context = toForecastWarningParkContext(park);

  const [hourlyForecast, districtForecast, sunMoonTiming, disasterWarning] =
    await Promise.all([
      loadHourlyForecastModule(context, now),
      loadDistrictForecastModule(context, now),
      loadSunMoonTimingModule(now),
      loadDisasterWarningModule(context, now),
    ]);

  return {
    hourlyForecast,
    districtForecast,
    sunMoonTiming,
    disasterWarning,
  };
}

function createBaseResponse(
  requestStatus: ForecastWarningRequestStatus,
  requestedAt: string,
  message: string,
): ForecastWarningResponse {
  return {
    requestStatus,
    message,
    requestedAt,
    park: null,
    hourlyForecast: null,
    districtForecast: null,
    sunMoonTiming: null,
    disasterWarning: null,
  };
}

export function createInvalidForecastWarningResponse(requestedAt: string) {
  return createBaseResponse(
    "invalid_park",
    requestedAt,
    "未找到对应的公园参数。",
  );
}

export function createFailedForecastWarningResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  message = FORECAST_WARNING_FAILURE_MESSAGE,
) {
  return {
    ...createBaseResponse("failed", requestedAt, message),
    park: toForecastWarningParkContext(park),
  } satisfies ForecastWarningResponse;
}

export function createForecastWarningResponse(
  requestedAt: string,
  park: ParkWeatherContext,
  modules: ForecastWarningModules,
): ForecastWarningResponse {
  const moduleStatusList = [
    modules.hourlyForecast.status,
    modules.districtForecast.status,
    modules.sunMoonTiming.status,
    modules.disasterWarning.status,
  ];
  const allFailed = moduleStatusList.every((status) => status === "failed");
  const hasFailed = moduleStatusList.some((status) => status === "failed");

  if (allFailed) {
    return createFailedForecastWarningResponse(requestedAt, park);
  }

  return {
    ...createBaseResponse(
      hasFailed ? "partial" : "success",
      requestedAt,
      hasFailed ? "部分预报预警模块暂不可用。" : "预报预警信息已更新。",
    ),
    park: toForecastWarningParkContext(park),
    hourlyForecast: modules.hourlyForecast,
    districtForecast: modules.districtForecast,
    sunMoonTiming: modules.sunMoonTiming,
    disasterWarning: modules.disasterWarning,
  } satisfies ForecastWarningResponse;
}
