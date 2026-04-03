import type { NextRequest } from "next/server";
import { getParkById } from "@/lib/maps/park-options";
import { createParkWeatherContext } from "@/lib/weather/birding-outlook";
import {
  createFailedForecastWarningResponse,
  createForecastWarningResponse,
  createInvalidForecastWarningResponse,
  fetchForecastWarningModules,
} from "@/lib/weather/sz-forecast-warning";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedAt = new Date().toISOString();
  const parkId = request.nextUrl.searchParams.get("parkId")?.trim();

  if (!parkId) {
    return Response.json(createInvalidForecastWarningResponse(requestedAt), {
      status: 400,
    });
  }

  const park = getParkById(parkId);
  if (!park) {
    return Response.json(createInvalidForecastWarningResponse(requestedAt), {
      status: 400,
    });
  }

  const parkContext = createParkWeatherContext(park);

  try {
    const modules = await fetchForecastWarningModules(parkContext);
    const response = createForecastWarningResponse(requestedAt, parkContext, modules);

    if (response.requestStatus === "failed") {
      return Response.json(response, { status: 502 });
    }

    return Response.json(response);
  } catch {
    return Response.json(
      createFailedForecastWarningResponse(requestedAt, parkContext),
      {
        status: 502,
      },
    );
  }
}
