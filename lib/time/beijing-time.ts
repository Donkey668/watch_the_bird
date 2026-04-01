const BEIJING_TIME_ZONE = "Asia/Shanghai";

const beijingPartsFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: BEIJING_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export type BeijingTimeContext = {
  displayText: string;
  isoTimestamp: string;
  monthNumber: number;
  minutesSinceMidnight: number;
};

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function readNumericPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  const value = Number.parseInt(
    parts.find((part) => part.type === type)?.value ?? "",
    10,
  );

  if (Number.isNaN(value)) {
    throw new Error(`无法解析北京时间字段：${type}`);
  }

  return value;
}

export function getBeijingTimeContext(date = new Date()): BeijingTimeContext {
  const parts = beijingPartsFormatter.formatToParts(date);
  const year = readNumericPart(parts, "year");
  const month = readNumericPart(parts, "month");
  const day = readNumericPart(parts, "day");
  const parsedHour = readNumericPart(parts, "hour");
  const hour = parsedHour === 24 ? 0 : parsedHour;
  const minute = readNumericPart(parts, "minute");
  const second = readNumericPart(parts, "second");

  return {
    displayText: `${year}年${month}月${day}日 ${pad2(hour)}:${pad2(minute)}`,
    isoTimestamp: `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+08:00`,
    monthNumber: month,
    minutesSinceMidnight: hour * 60 + minute,
  };
}
