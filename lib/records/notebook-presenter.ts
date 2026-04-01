import {
  createNotebookSnapshot,
  toNotebookRecordSnapshot,
  type NotebookFieldErrors,
  type NotebookSnapshot,
  type StoredObservationRecord,
} from "./notebook";

export type NotebookListRequestStatus =
  | "success"
  | "empty"
  | "auth_required"
  | "failed";

export type NotebookMutationRequestStatus =
  | "success"
  | "invalid_input"
  | "auth_required"
  | "not_found"
  | "failed";

export type NotebookListResponse = {
  requestStatus: NotebookListRequestStatus;
  message: string;
  requestedAt: string;
  assistantAccount: string | null;
  notebook: NotebookSnapshot | null;
};

export type NotebookMutationResponse = {
  requestStatus: NotebookMutationRequestStatus;
  message: string;
  requestedAt: string;
  assistantAccount: string | null;
  notebook?: NotebookSnapshot | null;
  record?: ReturnType<typeof toNotebookRecordSnapshot> | null;
  deletedRecordId?: string | null;
  fieldErrors?: NotebookFieldErrors;
};

export const NOTEBOOK_RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Language": "zh-CN",
} as const;

function createBaseListResponse(
  requestStatus: NotebookListRequestStatus,
  message: string,
  requestedAt: string,
  assistantAccount: string | null,
  notebook: NotebookSnapshot | null,
): NotebookListResponse {
  return {
    requestStatus,
    message,
    requestedAt,
    assistantAccount,
    notebook,
  };
}

function createBaseMutationResponse(
  requestStatus: NotebookMutationRequestStatus,
  message: string,
  requestedAt: string,
  assistantAccount: string | null,
): NotebookMutationResponse {
  return {
    requestStatus,
    message,
    requestedAt,
    assistantAccount,
  };
}

export function createNotebookReadResponse(
  requestedAt: string,
  assistantAccount: string,
  records: StoredObservationRecord[],
) {
  const notebook = createNotebookSnapshot(records);

  if (notebook.records.length === 0) {
    return createBaseListResponse(
      "empty",
      "当前还没有个人观测记录。",
      requestedAt,
      assistantAccount,
      notebook,
    );
  }

  return createBaseListResponse(
    "success",
    "已加载个人观测记录。",
    requestedAt,
    assistantAccount,
    notebook,
  );
}

export function createNotebookAuthRequiredResponse(requestedAt: string) {
  return createBaseListResponse(
    "auth_required",
    "请登录个人空间！",
    requestedAt,
    null,
    null,
  );
}

export function createNotebookReadFailedResponse(
  requestedAt: string,
  assistantAccount: string | null,
) {
  return createBaseListResponse(
    "failed",
    "个人观测记录暂时不可用，请稍后重试。",
    requestedAt,
    assistantAccount,
    null,
  );
}

export function createNotebookCreateSuccessResponse(
  requestedAt: string,
  assistantAccount: string,
  record: StoredObservationRecord,
  notebook: NotebookSnapshot,
) {
  return {
    ...createBaseMutationResponse(
      "success",
      "已添加观测记录。",
      requestedAt,
      assistantAccount,
    ),
    record: toNotebookRecordSnapshot(record),
    notebook,
  } satisfies NotebookMutationResponse;
}

export function createNotebookDeleteSuccessResponse(
  requestedAt: string,
  assistantAccount: string,
  deletedRecordId: string,
  notebook: NotebookSnapshot,
) {
  return {
    ...createBaseMutationResponse(
      "success",
      "已删除观测记录。",
      requestedAt,
      assistantAccount,
    ),
    deletedRecordId,
    notebook,
  } satisfies NotebookMutationResponse;
}

export function createNotebookUpdateSuccessResponse(
  requestedAt: string,
  assistantAccount: string,
  record: StoredObservationRecord,
  notebook: NotebookSnapshot,
) {
  return {
    ...createBaseMutationResponse(
      "success",
      "已更新观测记录。",
      requestedAt,
      assistantAccount,
    ),
    record: toNotebookRecordSnapshot(record),
    notebook,
  } satisfies NotebookMutationResponse;
}

export function createNotebookInvalidInputResponse(
  requestedAt: string,
  assistantAccount: string | null,
  fieldErrors: NotebookFieldErrors,
) {
  return {
    ...createBaseMutationResponse(
      "invalid_input",
      "请完整填写日期、时间、鸟名和鸟点信息。",
      requestedAt,
      assistantAccount,
    ),
    fieldErrors,
  } satisfies NotebookMutationResponse;
}

export function createNotebookMutationAuthRequiredResponse(requestedAt: string) {
  return {
    ...createBaseMutationResponse(
      "auth_required",
      "请登录个人空间！",
      requestedAt,
      null,
    ),
    notebook: null,
  } satisfies NotebookMutationResponse;
}

export function createNotebookDeleteNotFoundResponse(
  requestedAt: string,
  assistantAccount: string,
) {
  return createBaseMutationResponse(
    "not_found",
    "未找到要删除的记录。",
    requestedAt,
    assistantAccount,
  );
}

export function createNotebookUpdateNotFoundResponse(
  requestedAt: string,
  assistantAccount: string,
) {
  return createBaseMutationResponse(
    "not_found",
    "未找到要更新的记录。",
    requestedAt,
    assistantAccount,
  );
}

export function createNotebookMutationFailedResponse(
  requestedAt: string,
  assistantAccount: string | null,
  message: string,
) {
  return createBaseMutationResponse(
    "failed",
    message,
    requestedAt,
    assistantAccount,
  );
}
