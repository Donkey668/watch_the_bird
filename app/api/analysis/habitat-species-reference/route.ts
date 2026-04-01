import type { NextRequest } from "next/server";
import {
  createEmptySpeciesResponse,
  createFailedSpeciesResponse,
  createInvalidParkSpeciesResponse,
  createSpeciesReferenceCollection,
  createSuccessSpeciesResponse,
  parseSpeciesReferenceView,
  readSpeciesWorkbookRecords,
} from "@/lib/species/habitat-species-reference";
import { resolveParkSpeciesWorkbookSource } from "@/lib/species/park-species-workbooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedAt = new Date().toISOString();
  const parkId = request.nextUrl.searchParams.get("parkId")?.trim();
  const view = parseSpeciesReferenceView(
    request.nextUrl.searchParams.get("view"),
  );

  if (!parkId) {
    return Response.json(createInvalidParkSpeciesResponse(requestedAt), {
      status: 400,
    });
  }

  const source = await resolveParkSpeciesWorkbookSource(parkId);
  if (!source) {
    return Response.json(createInvalidParkSpeciesResponse(requestedAt), {
      status: 400,
    });
  }

  if (source.sourceStatus === "missing") {
    return Response.json(
      createFailedSpeciesResponse(
        requestedAt,
        source.park,
        "missing",
        "当前公园的鸟种参考文件不存在。",
      ),
      {
        status: 404,
      },
    );
  }

  if (source.sourceStatus === "unreadable") {
    return Response.json(
      createFailedSpeciesResponse(
        requestedAt,
        source.park,
        "unreadable",
        "鸟种参考文件暂时无法读取，请稍后重试。",
      ),
      {
        status: 500,
      },
    );
  }

  try {
    const records = await readSpeciesWorkbookRecords(source);
    const collection = createSpeciesReferenceCollection(records, view);

    if (collection.totalCount === 0) {
      return Response.json(
        createEmptySpeciesResponse(requestedAt, source.park, collection),
      );
    }

    return Response.json(
      createSuccessSpeciesResponse(requestedAt, source.park, collection),
    );
  } catch {
    return Response.json(
      createFailedSpeciesResponse(
        requestedAt,
        source.park,
        "unreadable",
        "鸟种参考文件暂时无法读取，请稍后重试。",
      ),
      {
        status: 500,
      },
    );
  }
}
