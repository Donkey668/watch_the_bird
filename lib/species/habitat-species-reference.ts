import { readFile } from "node:fs/promises";
import type { ParkOption } from "@/lib/maps/park-options";
import type {
  ParkSpeciesDataSource,
  ParkSpeciesSourceStatus,
} from "@/lib/species/park-species-sources";

export const SPECIES_REFERENCE_VIEWS = ["preview", "full"] as const;
export const SPECIES_REFERENCE_PREVIEW_LIMIT = 10;

export type SpeciesReferenceView = (typeof SPECIES_REFERENCE_VIEWS)[number];
export type SpeciesReferenceRequestStatus =
  | "success"
  | "empty"
  | "invalid_park"
  | "failed";

export type BirdSpeciesRecord = {
  sequence: number;
  speciesName: string;
  residencyType: string;
  protectionLevel: string;
  ecologicalTraits: string;
  observationDifficulty: string;
};

export type SpeciesReferenceCollection = {
  view: SpeciesReferenceView;
  totalCount: number;
  returnedCount: number;
  hasMore: boolean;
  isComplete: boolean;
  records: BirdSpeciesRecord[];
};

export type SpeciesReferenceResponse = {
  requestStatus: SpeciesReferenceRequestStatus;
  message: string;
  requestedAt: string;
  parkId: string | null;
  parkName: string | null;
  sourceStatus: ParkSpeciesSourceStatus | null;
  collection: SpeciesReferenceCollection | null;
};

type RawSpeciesSourceRecord = {
  序号?: unknown;
  鸟种名称?: unknown;
  居留类型?: unknown;
  保护级别?: unknown;
  生态特征?: unknown;
  观测难度?: unknown;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeRequiredText(value: unknown, fallback: string) {
  const text = normalizeText(value);
  return text || fallback;
}

function normalizeRecord(
  row: RawSpeciesSourceRecord,
  fallbackSequence: number,
): BirdSpeciesRecord | null {
  const speciesName = normalizeText(row["鸟种名称"]);
  if (!speciesName) {
    return null;
  }

  const parsedSequence = Number.parseInt(normalizeText(row["序号"]), 10);

  return {
    sequence: Number.isFinite(parsedSequence) ? parsedSequence : fallbackSequence,
    speciesName,
    residencyType: normalizeRequiredText(row["居留类型"], "暂无居留类型信息"),
    protectionLevel: normalizeRequiredText(row["保护级别"], "暂无保护级别信息"),
    ecologicalTraits: normalizeRequiredText(row["生态特征"], "暂无生态特征信息"),
    observationDifficulty: normalizeRequiredText(
      row["观测难度"],
      "暂无观测难度信息",
    ),
  };
}

export function parseSpeciesReferenceView(
  value: string | null | undefined,
): SpeciesReferenceView {
  return value === "full" ? "full" : "preview";
}

function isRawSpeciesSourceRecord(value: unknown): value is RawSpeciesSourceRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRawSpeciesSourceRecordArray(
  value: unknown,
): value is RawSpeciesSourceRecord[] {
  return Array.isArray(value) && value.every(isRawSpeciesSourceRecord);
}

function extractRawSpeciesSourceRecords(payload: unknown) {
  if (isRawSpeciesSourceRecordArray(payload)) {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "records" in payload &&
    isRawSpeciesSourceRecordArray(payload.records)
  ) {
    return payload.records;
  }

  throw new Error("Species JSON source returned an invalid payload.");
}

export async function readSpeciesSourceRecords(
  source: ParkSpeciesDataSource,
) {
  const rawContent = await readFile(source.absolutePath, "utf8");
  const payload = JSON.parse(rawContent) as unknown;
  const rows = extractRawSpeciesSourceRecords(payload);

  return rows
    .map((row, index) => normalizeRecord(row, index + 1))
    .filter((record): record is BirdSpeciesRecord => record !== null);
}

export function createSpeciesReferenceCollection(
  records: BirdSpeciesRecord[],
  view: SpeciesReferenceView,
): SpeciesReferenceCollection {
  const slicedRecords =
    view === "preview"
      ? records.slice(0, SPECIES_REFERENCE_PREVIEW_LIMIT)
      : records;

  return {
    view,
    totalCount: records.length,
    returnedCount: slicedRecords.length,
    hasMore: records.length > slicedRecords.length,
    isComplete: records.length <= slicedRecords.length,
    records: slicedRecords,
  };
}

function createBaseResponse(
  requestStatus: SpeciesReferenceRequestStatus,
  requestedAt: string,
  message: string,
): SpeciesReferenceResponse {
  return {
    requestStatus,
    message,
    requestedAt,
    parkId: null,
    parkName: null,
    sourceStatus: null,
    collection: null,
  };
}

export function createInvalidParkSpeciesResponse(requestedAt: string) {
  return createBaseResponse(
    "invalid_park",
    requestedAt,
    "未找到对应的公园参数。",
  );
}

export function createFailedSpeciesResponse(
  requestedAt: string,
  park: ParkOption,
  sourceStatus: Exclude<ParkSpeciesSourceStatus, "available">,
  message: string,
) {
  return {
    ...createBaseResponse("failed", requestedAt, message),
    parkId: park.id,
    parkName: park.name,
    sourceStatus,
  } satisfies SpeciesReferenceResponse;
}

export function createEmptySpeciesResponse(
  requestedAt: string,
  park: ParkOption,
  collection: SpeciesReferenceCollection,
) {
  return {
    ...createBaseResponse(
      "empty",
      requestedAt,
      "当前公园暂无可展示的鸟种参考记录。",
    ),
    parkId: park.id,
    parkName: park.name,
    sourceStatus: "available",
    collection,
  } satisfies SpeciesReferenceResponse;
}

export function createSuccessSpeciesResponse(
  requestedAt: string,
  park: ParkOption,
  collection: SpeciesReferenceCollection,
) {
  const message =
    collection.view === "full"
      ? `已加载${park.name}的全部鸟种参考。`
      : `已加载${park.name}的鸟种参考预览。`;

  return {
    ...createBaseResponse("success", requestedAt, message),
    parkId: park.id,
    parkName: park.name,
    sourceStatus: "available",
    collection,
  } satisfies SpeciesReferenceResponse;
}
