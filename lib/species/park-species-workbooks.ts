// Deprecated compatibility layer. New code should import from
// `@/lib/species/park-species-sources`.
export {
  PARKINFO_DIRECTORY_PATH,
  PARK_SPECIES_SOURCE_FILE_MAP as PARK_SPECIES_WORKBOOK_FILE_MAP,
  type ParkSpeciesDataSource as ParkSpeciesWorkbookSource,
  type ParkSpeciesSourceStatus,
  resolveParkSpeciesDataSource as resolveParkSpeciesWorkbookSource,
} from "@/lib/species/park-species-sources";
