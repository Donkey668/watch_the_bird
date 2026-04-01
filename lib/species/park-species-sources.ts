import { access, constants } from "node:fs/promises";
import path from "node:path";
import { getParkById, isParkId, type ParkId, type ParkOption } from "@/lib/maps/park-options";

export const PARKINFO_DIRECTORY_PATH = path.join(process.cwd(), "parkinfo");

export const PARK_SPECIES_SOURCE_FILE_MAP: Record<ParkId, string> = {
  "shenzhen-bay-park": "Shenzhen Bay Park.json",
  "shenzhen-east-lake-park": "Shenzhen Donghu Park.json",
  "bijia-mountain-park": "Bijiashan Park.json",
  "fairy-lake-botanical-garden": "Fairylake Botanical Garden.json",
};

export type ParkSpeciesSourceStatus = "available" | "missing" | "unreadable";

export type ParkSpeciesDataSource = {
  park: ParkOption;
  fileName: string;
  absolutePath: string;
  sourceStatus: ParkSpeciesSourceStatus;
};

function createSourcePath(fileName: string) {
  return path.join(PARKINFO_DIRECTORY_PATH, fileName);
}

async function getSourceStatus(absolutePath: string): Promise<ParkSpeciesSourceStatus> {
  try {
    await access(absolutePath, constants.R_OK);
    return "available";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "missing";
    }

    return "unreadable";
  }
}

export async function resolveParkSpeciesDataSource(parkId: string) {
  if (!isParkId(parkId)) {
    return null;
  }

  const park = getParkById(parkId);
  if (!park) {
    return null;
  }

  const fileName = PARK_SPECIES_SOURCE_FILE_MAP[park.id];
  const absolutePath = createSourcePath(fileName);
  const sourceStatus = await getSourceStatus(absolutePath);

  return {
    park,
    fileName,
    absolutePath,
    sourceStatus,
  } satisfies ParkSpeciesDataSource;
}
