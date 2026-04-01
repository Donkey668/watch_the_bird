"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthSessionSnapshot } from "@/lib/auth/login";
import type { NotebookRecordInput, NotebookRecordSnapshot, NotebookSnapshot } from "@/lib/records/notebook";
import type {
  NotebookListResponse,
  NotebookMutationResponse,
} from "@/lib/records/notebook-presenter";
import { RecordEditorDialog } from "./record-editor-dialog";
import { RecordsNotebookPanel } from "./records-notebook-panel";

type RecordsScreenProps = {
  authSession: AuthSessionSnapshot;
  authPromptDismissedVersion: number;
  onRequireAuth: (action: "create" | "edit" | "delete" | "view") => void;
};

export function RecordsScreen({
  authSession,
  authPromptDismissedVersion,
  onRequireAuth,
}: RecordsScreenProps) {
  const [notebook, setNotebook] = useState<NotebookSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(
    authSession.status === "authenticated",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editingRecord, setEditingRecord] =
    useState<NotebookRecordSnapshot | null>(null);
  const [isEditorSubmitting, setIsEditorSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotebookRecordSnapshot | null>(
    null,
  );
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [pendingGuestAction, setPendingGuestAction] = useState<
    "create" | "edit" | "delete" | "view" | null
  >(null);

  const loadRequestVersionRef = useRef(0);
  const mutationRequestVersionRef = useRef(0);

  const loadNotebook = useCallback(async () => {
    if (
      authSession.status !== "authenticated" ||
      !authSession.assistantAccount
    ) {
      setNotebook(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    const requestVersion = ++loadRequestVersionRef.current;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/records/notebook", {
        cache: "no-store",
      });
      const payload = (await response.json()) as NotebookListResponse;

      if (requestVersion !== loadRequestVersionRef.current) {
        return;
      }

      if (response.ok && payload.notebook) {
        setNotebook(payload.notebook);
        setErrorMessage(null);
        return;
      }

      setNotebook(null);
      setErrorMessage(payload.message);
    } catch {
      if (requestVersion !== loadRequestVersionRef.current) {
        return;
      }

      setNotebook(null);
      setErrorMessage("个人观测记录暂时不可用，请稍后重试。");
    } finally {
      if (requestVersion === loadRequestVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [authSession.assistantAccount, authSession.status]);

  useEffect(() => {
    if (
      authSession.status !== "authenticated" ||
      !authSession.assistantAccount
    ) {
      loadRequestVersionRef.current += 1;
      mutationRequestVersionRef.current += 1;
      setNotebook(null);
      setErrorMessage(null);
      setIsLoading(false);
      setEditorMode(null);
      setEditingRecord(null);
      setIsEditorSubmitting(false);
      setDeleteTarget(null);
      setIsDeleteSubmitting(false);
      setPendingGuestAction(null);
      return;
    }

    void loadNotebook();
  }, [authSession.assistantAccount, authSession.status, loadNotebook]);

  useEffect(() => {
    if (authSession.status === "guest") {
      setPendingGuestAction(null);
    }
  }, [authPromptDismissedVersion, authSession.status]);

  useEffect(() => {
    if (authSession.status !== "authenticated" || !pendingGuestAction) {
      return;
    }

    if (pendingGuestAction === "create") {
      setEditorMode("create");
      setEditingRecord(null);
    }

    setPendingGuestAction(null);
  }, [authSession.status, pendingGuestAction]);

  const handleEditorSubmit = useCallback(
    async (
      payload: NotebookRecordInput,
    ): Promise<
      | {
          ok: true;
        }
      | {
          ok: false;
          message: string;
          fieldErrors?: NotebookMutationResponse["fieldErrors"];
        }
    > => {
      if (
        authSession.status !== "authenticated" ||
        !authSession.assistantAccount
      ) {
        return {
          ok: false,
          message: "请登录个人空间！",
        };
      }

      const requestVersion = ++mutationRequestVersionRef.current;
      setIsEditorSubmitting(true);

      try {
        const isEditMode = editorMode === "edit" && editingRecord !== null;
        const response = await fetch(
          isEditMode
            ? `/api/records/notebook/${editingRecord.recordId}`
            : "/api/records/notebook",
          {
            method: isEditMode ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify(payload),
          },
        );
        const result = (await response.json()) as NotebookMutationResponse;

        if (requestVersion !== mutationRequestVersionRef.current) {
          return {
            ok: false,
            message: "保存请求已失效，请重试。",
          };
        }

        if (response.ok && result.requestStatus === "success" && result.notebook) {
          setNotebook(result.notebook);
          setErrorMessage(null);
          setEditorMode(null);
          setEditingRecord(null);
          return {
            ok: true,
          };
        }

        return {
          ok: false,
          message: result.message,
          fieldErrors: result.fieldErrors,
        };
      } catch {
        return {
          ok: false,
          message:
            editorMode === "edit"
              ? "更新观测记录失败，请稍后重试。"
              : "保存观测记录失败，请稍后重试。",
        };
      } finally {
        if (requestVersion === mutationRequestVersionRef.current) {
          setIsEditorSubmitting(false);
        }
      }
    },
    [authSession.assistantAccount, authSession.status, editingRecord, editorMode],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (
      !deleteTarget ||
      authSession.status !== "authenticated" ||
      !authSession.assistantAccount
    ) {
      return;
    }

    const requestVersion = ++mutationRequestVersionRef.current;
    setIsDeleteSubmitting(true);

    try {
      const response = await fetch(
        `/api/records/notebook/${deleteTarget.recordId}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );
      const result = (await response.json()) as NotebookMutationResponse;

      if (requestVersion !== mutationRequestVersionRef.current) {
        return;
      }

      if (response.ok && result.requestStatus === "success" && result.notebook) {
        setNotebook(result.notebook);
        setErrorMessage(null);
        setDeleteTarget(null);
        return;
      }

      setErrorMessage(result.message);
    } catch {
      if (requestVersion !== mutationRequestVersionRef.current) {
        return;
      }

      setErrorMessage("删除观测记录失败，请稍后重试。");
    } finally {
      if (requestVersion === mutationRequestVersionRef.current) {
        setIsDeleteSubmitting(false);
      }
    }
  }, [authSession.assistantAccount, authSession.status, deleteTarget]);

  const handleOpenCreate = useCallback(() => {
    if (authSession.status !== "authenticated") {
      setPendingGuestAction("create");
      onRequireAuth("create");
      return;
    }

    setEditingRecord(null);
    setEditorMode("create");
  }, [authSession.status, onRequireAuth]);

  const handleOpenEdit = useCallback(
    (record: NotebookRecordSnapshot) => {
      if (authSession.status !== "authenticated") {
        setPendingGuestAction("edit");
        onRequireAuth("edit");
        return;
      }

      setEditingRecord(record);
      setEditorMode("edit");
    },
    [authSession.status, onRequireAuth],
  );

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          个人空间
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          个人观测记录
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          记录自己的观测发现，并回看最近外出时留下的笔记。
        </p>
      </header>

      <RecordsNotebookPanel
        authSession={authSession}
        notebook={notebook}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isDeleteSubmitting={isDeleteSubmitting}
        deleteTarget={deleteTarget}
        onOpenCreate={handleOpenCreate}
        onRequestEdit={handleOpenEdit}
        onRequestDelete={setDeleteTarget}
        onCancelDelete={() => {
          if (!isDeleteSubmitting) {
            setDeleteTarget(null);
          }
        }}
        onConfirmDelete={handleDeleteConfirm}
      />

      <RecordEditorDialog
        open={editorMode !== null}
        mode={editorMode ?? "create"}
        record={editingRecord}
        isSubmitting={isEditorSubmitting}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditorMode(null);
            setEditingRecord(null);
          }
        }}
        onSubmit={handleEditorSubmit}
      />
    </div>
  );
}
