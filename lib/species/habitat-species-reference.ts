import { readFile } from "node:fs/promises";
import { read, utils } from "xlsx";
import type { ParkOption } from "@/lib/maps/park-options";
import type {
  ParkSpeciesWorkbookSource,
  ParkSpeciesSourceStatus,
} from "@/lib/species/park-species-workbooks";

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

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeRequiredText(value: unknown, fallback: string) {
  const text = normalizeText(value);
  return text || fallback;
}

function normalizeRecord(
  row: unknown[],
  fallbackSequence: number,
): BirdSpeciesRecord | null {
  const speciesName = normalizeText(row[1]);
  if (!speciesName) {
    return null;
  }

  const parsedSequence = Number.parseInt(normalizeText(row[0]), 10);

  return {
    sequence: Number.isFinite(parsedSequence) ? parsedSequence : fallbackSequence,
    speciesName,
    residencyType: normalizeRequiredText(row[2], "暂无居留类型信息"),
    protectionLevel: normalizeRequiredText(row[3], "暂无保护级别信息"),
    ecologicalTraits: normalizeRequiredText(row[4], "暂无生态特征信息"),
    observationDifficulty: normalizeRequiredText(row[5], "暂无观测难度信息"),
  };
}

export function parseSpeciesReferenceView(
  value: string | null | undefined,
): SpeciesReferenceView {
  return value === "full" ? "full" : "preview";
}

export async function readSpeciesWorkbookRecords(
  source: ParkSpeciesWorkbookSource,
) {
  const workbookBuffer = await readFile(source.absolutePath);
  const workbook = read(workbookBuffer, {
    type: "buffer",
    cellText: true,
    dense: false,
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  return rows
    .slice(1)
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
