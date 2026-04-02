import {
  createUnavailableBirdEncyclopedia,
  generateBirdEncyclopedia,
} from "@/lib/identify/bird-encyclopedia";
import { prepareUploadedBirdImage } from "@/lib/identify/image-upload";
import { recognizeBirdFromImage } from "@/lib/identify/bird-recognition";
import {
  IDENTIFY_RESPONSE_HEADERS,
  createIdentifyFailedResponse,
  createIdentifyPartialResponse,
  createIdentifySuccessResponse,
  createIdentifyUnrecognizedResponse,
  createInvalidImageIdentifyResponse,
} from "@/lib/identify/identify-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createResponseInit(status: number) {
  return {
    status,
    headers: IDENTIFY_RESPONSE_HEADERS,
  };
}

export async function POST(request: Request) {
  const requestedAt = new Date().toISOString();

  try {
    const formData = await request.formData();
    const imageResult = await prepareUploadedBirdImage(formData.get("image"));

    if (!imageResult.ok) {
      return Response.json(
        createInvalidImageIdentifyResponse(requestedAt, imageResult.message),
        createResponseInit(400),
      );
    }

    const recognition = await recognizeBirdFromImage(imageResult.value);
    if (recognition.status === "unrecognized") {
      return Response.json(
        createIdentifyUnrecognizedResponse(requestedAt, recognition),
        createResponseInit(200),
      );
    }

    if (recognition.status !== "success") {
      return Response.json(
        createIdentifyFailedResponse(requestedAt, recognition.message),
        createResponseInit(502),
      );
    }

    try {
      const encyclopedia = await generateBirdEncyclopedia(recognition);

      return Response.json(
        createIdentifySuccessResponse(requestedAt, recognition, encyclopedia),
        createResponseInit(200),
      );
    } catch {
      return Response.json(
        createIdentifyPartialResponse(
          requestedAt,
          recognition,
          createUnavailableBirdEncyclopedia(),
        ),
        createResponseInit(200),
      );
    }
  } catch {
    return Response.json(
      createIdentifyFailedResponse(requestedAt),
      createResponseInit(502),
    );
  }
}
