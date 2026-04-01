import { access, constants } from "node:fs/promises";
import path from "node:path";
import { getParkById, isParkId, type ParkId, type ParkOption } from "@/lib/maps/park-options";

export const PARKINFO_DIRECTORY_PATH = path.join(process.cwd(), "parkinfo");

export const PARK_SPECIES_WORKBOOK_FILE_MAP: Record<ParkId, string> = {
  "shenzhen-bay-park": "Shenzhen Bay Park.xlsx",
  "shenzhen-east-lake-park": "Shenzhen Donghu Park.xlsx",
  "bijia-mountain-park": "Bijiashan Park.xlsx",
  "fairy-lake-botanical-garden": "Fairylake Botanical Garden.xlsx",
};

export type ParkSpeciesSourceStatus = "available" | "missing" | "unreadable";

export type ParkSpeciesWorkbookSource = {
  park: ParkOption;
  fileName: string;
  absolutePath: string;
  sourceStatus: ParkSpeciesSourceStatus;
};

function createWorkbookPath(fileName: string) {
  return path.join(PARKINFO_DIRECTORY_PATH, fileName);
}

async function getWorkbookStatus(absolutePath: string): Promise<ParkSpeciesSourceStatus> {
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

export async function resolveParkSpeciesWorkbookSource(parkId: string) {
  if (!isParkId(parkId)) {
    return null;
  }

  const park = getParkById(parkId);
  if (!park) {
    return null;
  }

  const fileName = PARK_SPECIES_WORKBOOK_FILE_MAP[park.id];
  const absolutePath = createWorkbookPath(fileName);
  const sourceStatus = await getWorkbookStatus(absolutePath);

  return {
    park,
    fileName,
    absolutePath,
    sourceStatus,
  } satisfies ParkSpeciesWorkbookSource;
}
