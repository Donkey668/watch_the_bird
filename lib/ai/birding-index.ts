import "server-only";

import {
  createUnavailableBirdingIndex,
  getBirdingModelName,
  type BirdingIndexAssessment,
  type BirdingIndexLevel,
  type DistrictWeatherSnapshot,
} from "@/lib/weather/birding-outlook";

const WEATHER_SCORE_MAP = new Map<string, number>([
  ["晴", 100],
  ["热", 100],
  ["少云", 98],
  ["晴间多云", 95],
  ["多云", 90],
  ["阴", 75],
  ["轻雾", 72],
  ["毛毛雨/细雨", 68],
  ["毛毛雨", 68],
  ["细雨", 68],
  ["阵雨", 70],
  ["小雨", 65],
  ["小雨-中雨", 62],
  ["中雨", 55],
  ["中雨-大雨", 50],
  ["霾", 55],
  ["中度霾", 48],
  ["雾", 52],
  ["浓雾", 48],
  ["大雾", 45],
  ["大雨", 30],
  ["雷阵雨", 25],
  ["雨", 20],
  ["强阵雨", 20],
  ["强雷阵雨", 15],
  ["重度霾", 10],
  ["强浓雾", 10],
  ["暴雨", 0],
  ["大暴雨", 0],
  ["特大暴雨", 0],
  ["大雨-暴雨", 0],
  ["暴雨-大暴雨", 0],
  ["大暴雨-特大暴雨", 0],
  ["极端降雨", 0],
  ["严重霾", 0],
  ["特强浓雾", 0],
]);

function normalizeWeatherText(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function readFirstNumber(value: string) {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreWeatherText(weatherText: string) {
  const weatherKey = normalizeWeatherText(weatherText);
  if (!weatherKey) {
    return null;
  }

  const score = WEATHER_SCORE_MAP.get(weatherKey);
  if (typeof score !== "number") {
    return null;
  }

  return {
    weatherKey,
    score,
  };
}

function parseWindLevel(windPower: string) {
  const normalizedWindPower = windPower.replace(/\s+/g, "").trim();
  if (!normalizedWindPower) {
    return null;
  }

  if (/^(?:≤|<=|＜|<)3(?:级)?$/.test(normalizedWindPower)) {
    return 3;
  }

  const matches = normalizedWindPower.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  const levels = matches
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));
  if (levels.length === 0) {
    return null;
  }

  const hasRange = /[-~～至到]/.test(normalizedWindPower);
  return hasRange ? Math.max(...levels) : levels[0];
}

function scoreWindLevel(level: number) {
  if (level <= 3) {
    return 100;
  }

  if (level === 4) {
    return 75;
  }

  if (level === 5) {
    return 70;
  }

  if (level === 6) {
    return 55;
  }

  if (level === 7) {
    return 45;
  }

  if (level === 8) {
    return 30;
  }

  if (level === 9) {
    return 20;
  }

  if (level === 10) {
    return 10;
  }

  return 0;
}

function scoreTemperature(temperature: number) {
  if (temperature >= 20 && temperature <= 25) {
    return 100;
  }

  if (
    (temperature >= 15 && temperature < 20) ||
    (temperature > 25 && temperature <= 30)
  ) {
    return 75;
  }

  if (
    (temperature >= 10 && temperature < 15) ||
    (temperature > 30 && temperature <= 35)
  ) {
    return 50;
  }

  return 20;
}

function scoreHumidity(humidity: number) {
  if (humidity >= 40 && humidity <= 60) {
    return 100;
  }

  if ((humidity >= 30 && humidity < 40) || (humidity > 60 && humidity <= 70)) {
    return 75;
  }

  if (humidity < 30 || (humidity > 70 && humidity <= 80)) {
    return 50;
  }

  return 20;
}

function resolveBirdingLevel(totalScore: number): BirdingIndexLevel {
  if (totalScore >= 80) {
    return "适宜";
  }

  if (totalScore >= 60) {
    return "较适宜";
  }

  return "不适宜";
}

function buildFailureReason(snapshot: DistrictWeatherSnapshot) {
  const weatherResult = scoreWeatherText(snapshot.weatherText);
  if (!weatherResult) {
    return `当前天气现象“${snapshot.weatherText}”暂不支持本地观鸟指数换算。`;
  }

  if (parseWindLevel(snapshot.windPower) === null) {
    return `无法解析当前风力信息：${snapshot.windPower}。`;
  }

  if (readFirstNumber(snapshot.temperature) === null) {
    return `无法解析当前温度信息：${snapshot.temperature}。`;
  }

  if (readFirstNumber(snapshot.humidity) === null) {
    return `无法解析当前湿度信息：${snapshot.humidity}。`;
  }

  return "观鸟指数暂时不可用。";
}

function buildWeightedScoreResult(snapshot: DistrictWeatherSnapshot) {
  const weatherResult = scoreWeatherText(snapshot.weatherText);
  const windLevel = parseWindLevel(snapshot.windPower);
  const temperature = readFirstNumber(snapshot.temperature);
  const humidity = readFirstNumber(snapshot.humidity);

  if (
    !weatherResult ||
    windLevel === null ||
    temperature === null ||
    humidity === null
  ) {
    return null;
  }

  const weatherScore = weatherResult.score;
  const windScore = scoreWindLevel(windLevel);
  const temperatureScore = scoreTemperature(temperature);
  const humidityScore = scoreHumidity(humidity);
  const totalScore = Math.round(
    weatherScore * 0.4 +
      windScore * 0.2 +
      temperatureScore * 0.2 +
      humidityScore * 0.2,
  );

  return {
    level: resolveBirdingLevel(totalScore),
    rawResult: {
      weatherKey: weatherResult.weatherKey,
      weatherScore,
      windLevel,
      windScore,
      temperature,
      temperatureScore,
      humidity,
      humidityScore,
      totalScore,
      weights: {
        weather: 0.4,
        wind: 0.2,
        temperature: 0.2,
        humidity: 0.2,
      },
    } satisfies Record<string, unknown>,
  };
}

export async function assessBirdingIndex(
  snapshot: DistrictWeatherSnapshot,
): Promise<BirdingIndexAssessment> {
  const modelName = getBirdingModelName();
  const result = buildWeightedScoreResult(snapshot);

  if (!result) {
    return createUnavailableBirdingIndex(
      modelName,
      buildFailureReason(snapshot),
    );
  }

  return {
    level: result.level,
    status: "success",
    generatedAt: new Date().toISOString(),
    modelName,
    rawResult: result.rawResult,
    failureReason: null,
  };
}
