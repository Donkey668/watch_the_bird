import { resolveBirdPointFromCoordinates } from "@/lib/records/location-resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCATION_RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Language": "zh-CN",
} as const;

function createResponseInit(status: number) {
  return {
    status,
    headers: LOCATION_RESPONSE_HEADERS,
  };
}

export async function GET(request: Request) {
  const requestedAt = new Date().toISOString();
  const { searchParams } = new URL(request.url);

  try {
    const result = await resolveBirdPointFromCoordinates({
      longitude: searchParams.get("longitude"),
      latitude: searchParams.get("latitude"),
      source: searchParams.get("source"),
    });

    if (!result.ok) {
      return Response.json(
        {
          requestStatus: "invalid_input",
          message: result.message,
          requestedAt,
          location: null,
        },
        createResponseInit(400),
      );
    }

    return Response.json(
      {
        requestStatus: "success",
        message: "已解析鸟点位置。",
        requestedAt,
        location: result.location,
      },
      createResponseInit(200),
    );
  } catch {
    return Response.json(
      {
        requestStatus: "failed",
        message: "位置解析失败，请稍后重试。",
        requestedAt,
        location: null,
      },
      createResponseInit(500),
    );
  }
}
