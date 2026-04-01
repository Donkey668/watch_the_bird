import { getBeijingTimeContext } from "@/lib/time/beijing-time";
import type {
  AnalysisOverviewSnapshot,
  BirdingIndexAssessment,
  BirdingIndexLevel,
  HabitatActivityValue,
  MigrationSignalValue,
} from "@/lib/weather/birding-outlook";

function resolveHabitatActivityByWindow(
  level: BirdingIndexLevel,
  minutesSinceMidnight: number,
): HabitatActivityValue {
  if (level === "不适宜") {
    return "较低";
  }

  if (minutesSinceMidnight >= 6 * 60 && minutesSinceMidnight < 9 * 60) {
    return "较高";
  }

  if (minutesSinceMidnight >= 9 * 60 && minutesSinceMidnight < 12 * 60) {
    return level === "适宜" ? "较高" : "中等";
  }

  if (minutesSinceMidnight >= 12 * 60 && minutesSinceMidnight < 14 * 60) {
    return "中等";
  }

  if (minutesSinceMidnight >= 14 * 60 && minutesSinceMidnight < 16 * 60) {
    return level === "适宜" ? "较高" : "中等";
  }

  if (minutesSinceMidnight >= 16 * 60 && minutesSinceMidnight < 18 * 60) {
    return "较高";
  }

  return "较低";
}

function resolveHabitatActivity(
  birdingIndex: BirdingIndexAssessment,
  minutesSinceMidnight: number,
): HabitatActivityValue {
  if (birdingIndex.status !== "success" || !birdingIndex.level) {
    return "暂不可用";
  }

  return resolveHabitatActivityByWindow(
    birdingIndex.level,
    minutesSinceMidnight,
  );
}

function resolveMigrationSignal(monthNumber: number): MigrationSignalValue {
  if ([11, 12, 1, 2].includes(monthNumber)) {
    return "极高";
  }

  if ([3, 9, 10].includes(monthNumber)) {
    return "较高";
  }

  if ([4, 8].includes(monthNumber)) {
    return "中等";
  }

  return "较低";
}

export function createAnalysisOverviewSnapshot(
  birdingIndex: BirdingIndexAssessment,
  date = new Date(),
): AnalysisOverviewSnapshot {
  const beijingTime = getBeijingTimeContext(date);
  const habitatActivity = resolveHabitatActivity(
    birdingIndex,
    beijingTime.minutesSinceMidnight,
  );

  return {
    title: "分析总览",
    beijingTime: {
      displayText: beijingTime.displayText,
      isoTimestamp: beijingTime.isoTimestamp,
    },
    habitatActivity: {
      label: "栖息地活跃度",
      value: habitatActivity,
      status: habitatActivity === "暂不可用" ? "unavailable" : "success",
    },
    migrationSignal: {
      label: "迁徙信号",
      value: resolveMigrationSignal(beijingTime.monthNumber),
    },
    observationConfidence: {
      label: "观测可信度",
      value: "稳定",
    },
  };
}
