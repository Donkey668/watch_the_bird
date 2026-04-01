import {
  createNotebookRecord,
  readNotebookDocument,
} from "@/lib/records/notebook-repository";
import { resolveAssistantAccountFromCookies } from "@/lib/auth/session-resolver";
import { validateNotebookRecordInput } from "@/lib/records/notebook";
import {
  NOTEBOOK_RESPONSE_HEADERS,
  createNotebookAuthRequiredResponse,
  createNotebookCreateSuccessResponse,
  createNotebookInvalidInputResponse,
  createNotebookMutationAuthRequiredResponse,
  createNotebookMutationFailedResponse,
  createNotebookReadFailedResponse,
  createNotebookReadResponse,
} from "@/lib/records/notebook-presenter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createResponseInit(status: number) {
  return {
    status,
    headers: NOTEBOOK_RESPONSE_HEADERS,
  };
}

export async function GET() {
  const requestedAt = new Date().toISOString();
  const assistantAccountResolution = await resolveAssistantAccountFromCookies();

  if (assistantAccountResolution.status !== "authenticated") {
    return Response.json(
      createNotebookAuthRequiredResponse(requestedAt),
      createResponseInit(401),
    );
  }

  try {
    const document = await readNotebookDocument(
      assistantAccountResolution.assistantAccount,
    );

    return Response.json(
      createNotebookReadResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        document.records,
      ),
      createResponseInit(200),
    );
  } catch {
    return Response.json(
      createNotebookReadFailedResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
      ),
      createResponseInit(500),
    );
  }
}

export async function POST(request: Request) {
  const requestedAt = new Date().toISOString();
  const assistantAccountResolution = await resolveAssistantAccountFromCookies();

  if (assistantAccountResolution.status !== "authenticated") {
    return Response.json(
      createNotebookMutationAuthRequiredResponse(requestedAt),
      createResponseInit(401),
    );
  }

  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const validationResult = validateNotebookRecordInput(payload);
  if (!validationResult.ok) {
    return Response.json(
      createNotebookInvalidInputResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        validationResult.fieldErrors,
      ),
      createResponseInit(400),
    );
  }

  try {
    const result = await createNotebookRecord(
      assistantAccountResolution.assistantAccount,
      validationResult.value,
    );

    return Response.json(
      createNotebookCreateSuccessResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        result.record,
        result.notebook,
      ),
      createResponseInit(201),
    );
  } catch {
    return Response.json(
      createNotebookMutationFailedResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        "保存观测记录失败，请稍后重试。",
      ),
      createResponseInit(500),
    );
  }
}
