import {
  deleteNotebookRecord,
  updateNotebookRecord,
} from "@/lib/records/notebook-repository";
import { resolveAssistantAccountFromCookies } from "@/lib/auth/session-resolver";
import { validateNotebookRecordInput } from "@/lib/records/notebook";
import {
  NOTEBOOK_RESPONSE_HEADERS,
  createNotebookDeleteNotFoundResponse,
  createNotebookDeleteSuccessResponse,
  createNotebookInvalidInputResponse,
  createNotebookMutationAuthRequiredResponse,
  createNotebookMutationFailedResponse,
  createNotebookUpdateNotFoundResponse,
  createNotebookUpdateSuccessResponse,
} from "@/lib/records/notebook-presenter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotebookRecordRouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

function createResponseInit(status: number) {
  return {
    status,
    headers: NOTEBOOK_RESPONSE_HEADERS,
  };
}

export async function DELETE(
  _request: Request,
  context: NotebookRecordRouteContext,
) {
  const requestedAt = new Date().toISOString();
  const assistantAccountResolution = await resolveAssistantAccountFromCookies();

  if (assistantAccountResolution.status !== "authenticated") {
    return Response.json(
      createNotebookMutationAuthRequiredResponse(requestedAt),
      createResponseInit(401),
    );
  }

  const { recordId } = await context.params;
  const normalizedRecordId = recordId.trim();

  if (!normalizedRecordId) {
    return Response.json(
      createNotebookDeleteNotFoundResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
      ),
      createResponseInit(404),
    );
  }

  try {
    const result = await deleteNotebookRecord(
      assistantAccountResolution.assistantAccount,
      normalizedRecordId,
    );

    if (!result.ok) {
      return Response.json(
        createNotebookDeleteNotFoundResponse(
          requestedAt,
          assistantAccountResolution.assistantAccount,
        ),
        createResponseInit(404),
      );
    }

    return Response.json(
      createNotebookDeleteSuccessResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        normalizedRecordId,
        result.notebook,
      ),
      createResponseInit(200),
    );
  } catch {
    return Response.json(
      createNotebookMutationFailedResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        "删除观测记录失败，请稍后重试。",
      ),
      createResponseInit(500),
    );
  }
}

export async function PATCH(
  request: Request,
  context: NotebookRecordRouteContext,
) {
  const requestedAt = new Date().toISOString();
  const assistantAccountResolution = await resolveAssistantAccountFromCookies();

  if (assistantAccountResolution.status !== "authenticated") {
    return Response.json(
      createNotebookMutationAuthRequiredResponse(requestedAt),
      createResponseInit(401),
    );
  }

  const { recordId } = await context.params;
  const normalizedRecordId = recordId.trim();

  if (!normalizedRecordId) {
    return Response.json(
      createNotebookUpdateNotFoundResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
      ),
      createResponseInit(404),
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
    const result = await updateNotebookRecord(
      assistantAccountResolution.assistantAccount,
      normalizedRecordId,
      validationResult.value,
    );

    if (!result.ok) {
      return Response.json(
        createNotebookUpdateNotFoundResponse(
          requestedAt,
          assistantAccountResolution.assistantAccount,
        ),
        createResponseInit(404),
      );
    }

    return Response.json(
      createNotebookUpdateSuccessResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        result.record,
        result.notebook,
      ),
      createResponseInit(200),
    );
  } catch {
    return Response.json(
      createNotebookMutationFailedResponse(
        requestedAt,
        assistantAccountResolution.assistantAccount,
        "更新观测记录失败，请稍后重试。",
      ),
      createResponseInit(500),
    );
  }
}
