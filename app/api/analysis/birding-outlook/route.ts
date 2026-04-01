import type { NextRequest } from "next/server";
import { assessBirdingIndex } from "@/lib/ai/birding-index";
import { getParkById } from "@/lib/maps/park-options";
import { fetchDistrictWeather } from "@/lib/weather/amap-weather";
import {
  createFailedResponse,
  createInvalidParkResponse,
  createParkWeatherContext,
  createPartialResponse,
  createSuccessResponse,
} from "@/lib/weather/birding-outlook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedAt = new Date().toISOString();
  const parkId = request.nextUrl.searchParams.get("parkId")?.trim();

  if (!parkId) {
    return Response.json(createInvalidParkResponse(requestedAt), {
      status: 400,
    });
  }

  const park = getParkById(parkId);
  if (!park) {
    return Response.json(createInvalidParkResponse(requestedAt), {
      status: 400,
    });
  }

  const parkContext = createParkWeatherContext(park);
  const weatherResult = await fetchDistrictWeather(parkContext);

  if (!weatherResult.ok) {
    return Response.json(
      createFailedResponse(requestedAt, parkContext, weatherResult.message),
      {
        status: 502,
      },
    );
  }

  const birdingIndex = await assessBirdingIndex(weatherResult.data);
  if (birdingIndex.status === "success") {
    return Response.json(
      createSuccessResponse(
        requestedAt,
        parkContext,
        weatherResult.data,
        birdingIndex,
      ),
    );
  }

  return Response.json(
    createPartialResponse(
      requestedAt,
      parkContext,
      weatherResult.data,
      birdingIndex,
    ),
  );
}
