import type { NotebookRecordSnapshot } from "./notebook";

export type NotebookExportContext = {
  assistantAccount: string;
  isAuthenticated: boolean;
  recordCount: number;
};

export type NotebookExportLineItem = {
  sequence: number;
  observationDate: string;
  observationTime: string;
  birdPoint: string;
  speciesName: string;
};

export type NotebookExportDocument = {
  fileName: string;
  mimeType: "text/plain;charset=utf-8";
  content: string;
  lineCount: number;
};

export type NotebookExportFailureReason =
  | "auth_required"
  | "invalid_account"
  | "empty_records"
  | "invalid_context"
  | "unsupported_environment";

export type NotebookExportResult =
  | {
      ok: true;
      document: NotebookExportDocument;
    }
  | {
      ok: false;
      reason: NotebookExportFailureReason;
    };

const EXPORT_MIME_TYPE = "text/plain;charset=utf-8" as const;
const FILE_NAME_INVALID_CHARACTERS = /[\\/:*?"<>|\u0000-\u001F]/g;
const FILE_NAME_TRAILING_DOTS_SPACES = /[. ]+$/g;
const WINDOWS_RESERVED_FILE_NAMES =
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

function normalizeText(value: string) {
  return value.trim();
}

export function sanitizeNotebookExportAccountName(assistantAccount: string) {
  const normalizedAccount = normalizeText(assistantAccount);
  if (!normalizedAccount) {
    return "";
  }

  const replacedName = normalizedAccount
    .replace(FILE_NAME_INVALID_CHARACTERS, "_")
    .replace(FILE_NAME_TRAILING_DOTS_SPACES, "");
  if (!replacedName) {
    return "";
  }

  if (WINDOWS_RESERVED_FILE_NAMES.test(replacedName)) {
    return `${replacedName}_`;
  }

  return replacedName;
}

export function buildNotebookExportFileName(assistantAccount: string) {
  const sanitizedAccount = sanitizeNotebookExportAccountName(assistantAccount);
  if (!sanitizedAccount) {
    return null;
  }

  return `${sanitizedAccount}的观鸟记录.txt`;
}

export function formatNotebookExportTime(observationTime: string) {
  const normalizedTime = normalizeText(observationTime);
  const timeMatch = normalizedTime.match(/^(\d{2})[:\-](\d{2})$/);
  if (!timeMatch) {
    return normalizedTime.replaceAll("-", ":");
  }

  return `${timeMatch[1]}:${timeMatch[2]}`;
}

export function toNotebookExportLineItem(
  record: NotebookRecordSnapshot,
  sequence: number,
): NotebookExportLineItem {
  return {
    sequence,
    observationDate: normalizeText(record.observationDate),
    observationTime: normalizeText(record.observationTime),
    birdPoint: normalizeText(record.birdPoint),
    speciesName: normalizeText(record.speciesName),
  };
}

function sortExportRecordsByObservationDateTime(
  records: NotebookRecordSnapshot[],
) {
  return [...records].sort((left, right) => {
    if (left.observationDateTimeIso !== right.observationDateTimeIso) {
      return left.observationDateTimeIso.localeCompare(right.observationDateTimeIso);
    }

    if (left.observationDate !== right.observationDate) {
      return left.observationDate.localeCompare(right.observationDate);
    }

    if (left.observationTime !== right.observationTime) {
      return left.observationTime.localeCompare(right.observationTime);
    }

    if (left.updatedAt !== right.updatedAt) {
      return left.updatedAt.localeCompare(right.updatedAt);
    }

    return left.recordId.localeCompare(right.recordId);
  });
}

export function formatNotebookExportLine(lineItem: NotebookExportLineItem) {
  return `${lineItem.sequence}. 日期：${lineItem.observationDate}；时间： ${formatNotebookExportTime(lineItem.observationTime)}；鸟点：${lineItem.birdPoint}；鸟名：${lineItem.speciesName}`;
}

export function buildNotebookExportContent(lineItems: NotebookExportLineItem[]) {
  return lineItems.map(formatNotebookExportLine).join("\n");
}

export function buildNotebookExportDocument(
  assistantAccount: string,
  records: NotebookRecordSnapshot[],
): NotebookExportDocument | null {
  const fileName = buildNotebookExportFileName(assistantAccount);
  if (!fileName) {
    return null;
  }

  const sortedRecords = sortExportRecordsByObservationDateTime(records);
  const lineItems = sortedRecords.map((record, index) =>
    toNotebookExportLineItem(record, index + 1),
  );

  return {
    fileName,
    mimeType: EXPORT_MIME_TYPE,
    content: buildNotebookExportContent(lineItems),
    lineCount: lineItems.length,
  };
}

export function triggerNotebookExportDownload(
  exportDocument: NotebookExportDocument,
) {
  if (
    typeof window === "undefined" ||
    typeof window.document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return false;
  }

  const blob = new Blob([`\uFEFF${exportDocument.content}`], {
    type: exportDocument.mimeType,
  });
  const objectUrl = URL.createObjectURL(blob);

  const link = window.document.createElement("a");
  link.href = objectUrl;
  link.download = exportDocument.fileName;
  link.rel = "noopener";
  link.style.display = "none";

  window.document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);

  return true;
}

export function exportNotebookRecords(options: {
  context: NotebookExportContext;
  records: NotebookRecordSnapshot[];
}): NotebookExportResult {
  const { context, records } = options;
  if (!context.isAuthenticated) {
    return {
      ok: false,
      reason: "auth_required",
    };
  }

  const assistantAccount = normalizeText(context.assistantAccount);
  if (!assistantAccount) {
    return {
      ok: false,
      reason: "invalid_account",
    };
  }

  if (!Number.isInteger(context.recordCount) || context.recordCount < 0) {
    return {
      ok: false,
      reason: "invalid_context",
    };
  }

  if (
    context.recordCount === 0 ||
    records.length === 0 ||
    context.recordCount !== records.length
  ) {
    return {
      ok: false,
      reason: "empty_records",
    };
  }

  const exportDocument = buildNotebookExportDocument(assistantAccount, records);
  if (!exportDocument) {
    return {
      ok: false,
      reason: "invalid_account",
    };
  }

  const didStartDownload = triggerNotebookExportDownload(exportDocument);
  if (!didStartDownload) {
    return {
      ok: false,
      reason: "unsupported_environment",
    };
  }

  return {
    ok: true,
    document: exportDocument,
  };
}
