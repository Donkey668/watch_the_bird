import "server-only";

import type {
  DistrictWeatherSnapshot,
  ParkWeatherContext,
  WeatherDetail,
} from "@/lib/weather/birding-outlook";

const AMAP_WEATHER_ENDPOINT =
  "https://restapi.amap.com/v3/weather/weatherInfo";
const WEATHER_FAILURE_MESSAGE =
  "\u5929\u6c14\u4fe1\u606f\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002";

type AMapLiveWeather = {
  adcode?: string;
  city?: string;
  humidity?: string;
  humidity_float?: string;
  province?: string;
  reporttime?: string;
  temperature?: string;
  temperature_float?: string;
  weather?: string;
  winddirection?: string;
  windpower?: string;
  [key: string]: unknown;
};

type AMapWeatherResponse = {
  info?: string;
  infocode?: string;
  lives?: AMapLiveWeather[];
  status?: string;
};

function getWeatherApiKey() {
  const apiKey = process.env.AMAP_WEATHER_KEY?.trim();
  if (!apiKey) {
    throw new Error("\u7f3a\u5c11\u5929\u6c14\u670d\u52a1\u914d\u7f6e\u3002");
  }

  return apiKey;
}

function readText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function withSuffix(value: string, suffix: string) {
  return value ? `${value}${suffix}` : "\u6682\u65e0";
}

function createWeatherDetails(
  context: ParkWeatherContext,
  live: AMapLiveWeather,
): WeatherDetail[] {
  const details: WeatherDetail[] = [
    {
      key: "district",
      label: "\u6240\u5728\u533a\u53bf",
      value: context.districtName,
    },
    {
      key: "districtCode",
      label: "\u533a\u53bf\u7f16\u7801",
      value: context.districtCode,
    },
    {
      key: "province",
      label: "\u7701\u4efd",
      value: readText(live.province) || "\u6682\u65e0",
    },
    {
      key: "city",
      label: "\u57ce\u5e02",
      value: readText(live.city) || context.cityName,
    },
    {
      key: "weather",
      label: "\u5929\u6c14",
      value: readText(live.weather) || "\u6682\u65e0",
    },
    {
      key: "temperature",
      label: "\u6e29\u5ea6",
      value: withSuffix(readText(live.temperature), "\u00b0C"),
    },
    {
      key: "humidity",
      label: "\u6e7f\u5ea6",
      value: withSuffix(readText(live.humidity), "%"),
    },
    {
      key: "windDirection",
      label: "\u98ce\u5411",
      value: readText(live.winddirection) || "\u6682\u65e0",
    },
    {
      key: "windPower",
      label: "\u98ce\u529b",
      value: readText(live.windpower) || "\u6682\u65e0",
    },
    {
      key: "reportTime",
      label: "\u66f4\u65b0\u65f6\u95f4",
      value: readText(live.reporttime) || "\u6682\u65e0",
    },
  ];

  return details;
}

function normalizeWeatherSnapshot(
  context: ParkWeatherContext,
  payload: AMapWeatherResponse,
): DistrictWeatherSnapshot | null {
  const live = payload.lives?.[0];
  if (!live) {
    return null;
  }

  const weatherText = readText(live.weather);
  const reportTime = readText(live.reporttime);

  if (!weatherText || !reportTime) {
    return null;
  }

  return {
    districtName: context.districtName,
    districtCode: context.districtCode,
    weatherText,
    temperature: readText(live.temperature) || "\u6682\u65e0",
    humidity: readText(live.humidity) || "\u6682\u65e0",
    windDirection: readText(live.winddirection) || "\u6682\u65e0",
    windPower: readText(live.windpower) || "\u6682\u65e0",
    reportTime,
    rawStatus: "success",
    rawPayload: payload as Record<string, unknown>,
    details: createWeatherDetails(context, live),
  };
}

export function buildAMapWeatherUrl(districtCode: string) {
  const url = new URL(AMAP_WEATHER_ENDPOINT);
  url.searchParams.set("city", districtCode);
  url.searchParams.set("extensions", "base");
  url.searchParams.set("output", "JSON");
  url.searchParams.set("key", getWeatherApiKey());

  return url.toString();
}

export async function fetchDistrictWeather(
  context: ParkWeatherContext,
): Promise<
  | {
      ok: true;
      data: DistrictWeatherSnapshot;
    }
  | {
      ok: false;
      message: string;
    }
> {
  try {
    const response = await fetch(buildAMapWeatherUrl(context.districtCode), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: WEATHER_FAILURE_MESSAGE,
      };
    }

    const payload = (await response.json()) as AMapWeatherResponse;
    if (payload.status !== "1") {
      return {
        ok: false,
        message: WEATHER_FAILURE_MESSAGE,
      };
    }

    const weather = normalizeWeatherSnapshot(context, payload);
    if (!weather) {
      return {
        ok: false,
        message: WEATHER_FAILURE_MESSAGE,
      };
    }

    return {
      ok: true,
      data: weather,
    };
  } catch {
    return {
      ok: false,
      message: WEATHER_FAILURE_MESSAGE,
    };
  }
}
