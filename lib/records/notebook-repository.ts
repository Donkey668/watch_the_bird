import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createEmptyNotebookDocument,
  createNotebookSnapshot,
  createStoredObservationRecord,
  sortStoredRecords,
  updateStoredObservationRecord,
  type NotebookSnapshot,
  type StoredNotebookDocument,
  type StoredObservationRecord,
  type ValidNotebookRecordInput,
} from "./notebook";

const NOTEBOOK_STORAGE_DIRECTORY = path.join(process.cwd(), "data", "notebooks");

function createStorageKey(assistantAccount: string) {
  return Buffer.from(assistantAccount, "utf8").toString("hex");
}

function createNotebookFilePath(assistantAccount: string) {
  return path.join(
    NOTEBOOK_STORAGE_DIRECTORY,
    `${createStorageKey(assistantAccount)}.json`,
  );
}

async function ensureNotebookStorageDirectory() {
  await mkdir(NOTEBOOK_STORAGE_DIRECTORY, { recursive: true });
}

async function writeNotebookDocument(document: StoredNotebookDocument) {
  await ensureNotebookStorageDirectory();
  await writeFile(
    createNotebookFilePath(document.assistantAccount),
    JSON.stringify(document, null, 2),
    "utf8",
  );
}

export async function readNotebookDocument(assistantAccount: string) {
  await ensureNotebookStorageDirectory();

  try {
    const rawDocument = await readFile(
      createNotebookFilePath(assistantAccount),
      "utf8",
    );

    const parsedDocument = JSON.parse(rawDocument) as StoredNotebookDocument;
    if (
      parsedDocument.assistantAccount !== assistantAccount ||
      !Array.isArray(parsedDocument.records)
    ) {
      throw new Error("Notebook document payload is invalid.");
    }

    return {
      assistantAccount,
      records: sortStoredRecords(parsedDocument.records),
      updatedAt:
        typeof parsedDocument.updatedAt === "string"
          ? parsedDocument.updatedAt
          : new Date().toISOString(),
    } satisfies StoredNotebookDocument;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyNotebookDocument(assistantAccount);
    }

    throw error;
  }
}

export async function getNotebookSnapshot(
  assistantAccount: string,
): Promise<NotebookSnapshot> {
  const document = await readNotebookDocument(assistantAccount);
  return createNotebookSnapshot(document.records);
}

export async function createNotebookRecord(
  assistantAccount: string,
  input: ValidNotebookRecordInput,
) {
  const existingDocument = await readNotebookDocument(assistantAccount);
  const nextRecord = createStoredObservationRecord(assistantAccount, input);
  const nextRecords = sortStoredRecords([...existingDocument.records, nextRecord]);
  const nextDocument = {
    assistantAccount,
    records: nextRecords,
    updatedAt: nextRecord.updatedAt,
  } satisfies StoredNotebookDocument;

  await writeNotebookDocument(nextDocument);

  return {
    record: nextRecord,
    notebook: createNotebookSnapshot(nextRecords),
  };
}

export async function deleteNotebookRecord(
  assistantAccount: string,
  recordId: string,
): Promise<
  | {
      ok: true;
    deletedRecord: StoredObservationRecord;
    notebook: NotebookSnapshot;
  }
  | {
      ok: false;
      reason: "not_found";
    }
> {
  const existingDocument = await readNotebookDocument(assistantAccount);
  const targetRecord = existingDocument.records.find(
    (record) => record.recordId === recordId,
  );

  if (!targetRecord) {
    return {
      ok: false,
      reason: "not_found",
    };
  }

  const nextRecords = existingDocument.records.filter(
    (record) => record.recordId !== recordId,
  );
  const nextDocument = {
    assistantAccount,
    records: sortStoredRecords(nextRecords),
    updatedAt: new Date().toISOString(),
  } satisfies StoredNotebookDocument;

  await writeNotebookDocument(nextDocument);

  return {
    ok: true,
    deletedRecord: targetRecord,
    notebook: createNotebookSnapshot(nextDocument.records),
  };
}

export async function updateNotebookRecord(
  assistantAccount: string,
  recordId: string,
  input: ValidNotebookRecordInput,
): Promise<
  | {
      ok: true;
      record: StoredObservationRecord;
      notebook: NotebookSnapshot;
    }
  | {
      ok: false;
      reason: "not_found";
    }
> {
  const existingDocument = await readNotebookDocument(assistantAccount);
  const targetRecord = existingDocument.records.find(
    (record) => record.recordId === recordId,
  );

  if (!targetRecord) {
    return {
      ok: false,
      reason: "not_found",
    };
  }

  const updatedRecord = updateStoredObservationRecord(targetRecord, input);
  const nextRecords = sortStoredRecords(
    existingDocument.records.map((record) =>
      record.recordId === recordId ? updatedRecord : record,
    ),
  );
  const nextDocument = {
    assistantAccount,
    records: nextRecords,
    updatedAt: updatedRecord.updatedAt,
  } satisfies StoredNotebookDocument;

  await writeNotebookDocument(nextDocument);

  return {
    ok: true,
    record: updatedRecord,
    notebook: createNotebookSnapshot(nextDocument.records),
  };
}
