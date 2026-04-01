export const BEIJING_TIME_ZONE = "Asia/Shanghai";
export const NOTEBOOK_MAX_NOTE_LENGTH = 100;

export const NOTEBOOK_LOCATION_SOURCES = ["manual", "device", "map"] as const;

export type NotebookLocationSource =
  (typeof NOTEBOOK_LOCATION_SOURCES)[number];

export type NotebookCoordinates = {
  longitude: number;
  latitude: number;
};

export type NotebookSummary = {
  totalRecordCount: number;
  uniqueSpeciesCount: number;
};

export type NotebookRecordSnapshot = {
  recordId: string;
  observationDate: string;
  observationTime: string;
  observationDateTimeIso: string;
  birdPoint: string;
  speciesName: string;
  note: string;
  locationSource: NotebookLocationSource;
  coordinates: NotebookCoordinates | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredObservationRecord = NotebookRecordSnapshot & {
  assistantAccount: string;
};

export type StoredNotebookDocument = {
  assistantAccount: string;
  records: StoredObservationRecord[];
  updatedAt: string;
};

export type NotebookSnapshot = {
  summary: NotebookSummary;
  records: NotebookRecordSnapshot[];
};

export type NotebookFieldName =
  | "observationDate"
  | "observationTime"
  | "birdPoint"
  | "speciesName"
  | "note"
  | "coordinates";

export type NotebookFieldErrors = Partial<Record<NotebookFieldName, string>>;

export type NotebookRecordInput = {
  observationDate: string;
  observationTime: string;
  birdPoint: string;
  speciesName: string;
  note?: string;
  locationSource?: NotebookLocationSource;
  coordinates?: NotebookCoordinates | null;
};

export type ValidNotebookRecordInput = {
  observationDate: string;
  observationTime: string;
  birdPoint: string;
  speciesName: string;
  note: string;
  locationSource: NotebookLocationSource;
  coordinates: NotebookCoordinates | null;
};

export type NotebookRecordValidationResult =
  | {
      ok: true;
      value: ValidNotebookRecordInput;
    }
  | {
      ok: false;
      message: string;
      fieldErrors: NotebookFieldErrors;
    };

const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  timeZone: BEIJING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  timeZone: BEIJING_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readRawNote(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isLocationSource(value: unknown): value is NotebookLocationSource {
  return (
    typeof value === "string" &&
    NOTEBOOK_LOCATION_SOURCES.includes(value as NotebookLocationSource)
  );
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export type CoordinateValidationResult =
  | {
      ok: true;
      coordinates: NotebookCoordinates | null;
    }
  | {
      ok: false;
      message: string;
    };

export function validateNotebookCoordinates(
  value: unknown,
): CoordinateValidationResult {
  if (value == null) {
    return {
      ok: true as const,
      coordinates: null,
    };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false as const,
      message: "定位坐标格式无效。",
    };
  }

  const { longitude, latitude } = value as Partial<NotebookCoordinates>;
  if (!isFiniteCoordinate(longitude) || !isFiniteCoordinate(latitude)) {
    return {
      ok: false as const,
      message: "定位坐标格式无效。",
    };
  }

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return {
      ok: false as const,
      message: "定位坐标超出有效范围。",
    };
  }

  return {
    ok: true as const,
    coordinates: {
      longitude,
      latitude,
    },
  };
}

function extractDateParts(date: Date) {
  const dateParts = DATE_FORMATTER.formatToParts(date);
  const timeParts = TIME_FORMATTER.formatToParts(date);

  const year = dateParts.find((part) => part.type === "year")?.value ?? "";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";
  const day = dateParts.find((part) => part.type === "day")?.value ?? "";
  const hour = timeParts.find((part) => part.type === "hour")?.value ?? "";
  const minute = timeParts.find((part) => part.type === "minute")?.value ?? "";

  return {
    observationDate: `${year}-${month}-${day}`,
    observationTime: `${hour}:${minute}`,
  };
}

export function getCurrentBeijingDateTime(now = new Date()) {
  return extractDateParts(now);
}

export function isValidObservationDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidObservationTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export function countNoteCharacters(note: string) {
  return Array.from(note).length;
}

export function clipNoteCharacters(
  note: string,
  maxLength = NOTEBOOK_MAX_NOTE_LENGTH,
) {
  return Array.from(note).slice(0, maxLength).join("");
}

export function toObservationDateTimeIso(
  observationDate: string,
  observationTime: string,
) {
  const [year, month, day] = observationDate.split("-").map(Number);
  const [hour, minute] = observationTime.split(":").map(Number);

  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute)).toISOString();
}

export function createEmptyNotebookDocument(
  assistantAccount: string,
  updatedAt = new Date().toISOString(),
): StoredNotebookDocument {
  return {
    assistantAccount,
    records: [],
    updatedAt,
  };
}

export function sortStoredRecords(records: StoredObservationRecord[]) {
  return [...records].sort((left, right) => {
    if (left.observationDateTimeIso !== right.observationDateTimeIso) {
      return right.observationDateTimeIso.localeCompare(left.observationDateTimeIso);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function computeNotebookSummary(records: StoredObservationRecord[]) {
  const speciesNames = new Set(
    records
      .map((record) => record.speciesName.trim())
      .filter((speciesName) => speciesName.length > 0),
  );

  return {
    totalRecordCount: records.length,
    uniqueSpeciesCount: speciesNames.size,
  } satisfies NotebookSummary;
}

export function toNotebookRecordSnapshot(
  record: StoredObservationRecord,
): NotebookRecordSnapshot {
  return {
    recordId: record.recordId,
    observationDate: record.observationDate,
    observationTime: record.observationTime,
    observationDateTimeIso: record.observationDateTimeIso,
    birdPoint: record.birdPoint,
    speciesName: record.speciesName,
    note: record.note,
    locationSource: record.locationSource,
    coordinates: record.coordinates,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function createNotebookSnapshot(records: StoredObservationRecord[]) {
  const sortedRecords = sortStoredRecords(records);

  return {
    summary: computeNotebookSummary(sortedRecords),
    records: sortedRecords.map(toNotebookRecordSnapshot),
  } satisfies NotebookSnapshot;
}

export function validateNotebookRecordInput(
  payload: unknown,
): NotebookRecordValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      message: "请完整填写日期、时间、鸟名和鸟点信息。",
      fieldErrors: {
        observationDate: "请填写观测日期。",
        observationTime: "请填写观测时间。",
        birdPoint: "请填写鸟点。",
        speciesName: "请填写鸟名。",
      },
    };
  }

  const rawPayload = payload as Partial<NotebookRecordInput>;
  const observationDate = normalizeText(rawPayload.observationDate);
  const observationTime = normalizeText(rawPayload.observationTime);
  const birdPoint = normalizeText(rawPayload.birdPoint);
  const speciesName = normalizeText(rawPayload.speciesName);
  const rawNote = readRawNote(rawPayload.note);
  const note = clipNoteCharacters(rawNote);
  const locationSource = isLocationSource(rawPayload.locationSource)
    ? rawPayload.locationSource
    : "manual";

  const coordinatesResult = validateNotebookCoordinates(rawPayload.coordinates);
  const normalizedCoordinates = coordinatesResult.ok
    ? coordinatesResult.coordinates
    : null;
  const fieldErrors: NotebookFieldErrors = {};

  if (!observationDate) {
    fieldErrors.observationDate = "请填写观测日期。";
  } else if (!isValidObservationDate(observationDate)) {
    fieldErrors.observationDate = "观测日期格式应为 YYYY-MM-DD。";
  }

  if (!observationTime) {
    fieldErrors.observationTime = "请填写观测时间。";
  } else if (!isValidObservationTime(observationTime)) {
    fieldErrors.observationTime = "观测时间格式应为 HH:mm。";
  }

  if (!birdPoint) {
    fieldErrors.birdPoint = "请填写鸟点。";
  }

  if (!speciesName) {
    fieldErrors.speciesName = "请填写鸟名。";
  }

  if (countNoteCharacters(rawNote) > NOTEBOOK_MAX_NOTE_LENGTH) {
    fieldErrors.note = `备注不能超过 ${NOTEBOOK_MAX_NOTE_LENGTH} 个字。`;
  }

  if (!coordinatesResult.ok) {
    fieldErrors.coordinates = coordinatesResult.message;
  }

  if (locationSource === "manual" && normalizedCoordinates) {
    fieldErrors.coordinates = "手动填写鸟点时不应携带定位坐标。";
  }

  if (locationSource !== "manual" && normalizedCoordinates === null) {
    fieldErrors.coordinates = "定位或地图填充时需要有效坐标。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "请完整填写日期、时间、鸟名和鸟点信息。",
      fieldErrors,
    };
  }

  return {
    ok: true,
    value: {
      observationDate,
      observationTime,
      birdPoint,
      speciesName,
      note,
      locationSource,
      coordinates: normalizedCoordinates,
    },
  };
}

export function createStoredObservationRecord(
  assistantAccount: string,
  input: ValidNotebookRecordInput,
  now = new Date(),
): StoredObservationRecord {
  const timestamp = now.toISOString();

  return {
    recordId: crypto.randomUUID(),
    assistantAccount,
    observationDate: input.observationDate,
    observationTime: input.observationTime,
    observationDateTimeIso: toObservationDateTimeIso(
      input.observationDate,
      input.observationTime,
    ),
    birdPoint: input.birdPoint,
    speciesName: input.speciesName,
    note: input.note,
    locationSource: input.locationSource,
    coordinates: input.coordinates,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateStoredObservationRecord(
  record: StoredObservationRecord,
  input: ValidNotebookRecordInput,
  now = new Date(),
): StoredObservationRecord {
  return {
    ...record,
    observationDate: input.observationDate,
    observationTime: input.observationTime,
    observationDateTimeIso: toObservationDateTimeIso(
      input.observationDate,
      input.observationTime,
    ),
    birdPoint: input.birdPoint,
    speciesName: input.speciesName,
    note: input.note,
    locationSource: input.locationSource,
    coordinates: input.coordinates,
    updatedAt: now.toISOString(),
  };
}
