"use client";

import type { AuthSessionSnapshot } from "@/lib/auth/login";
import type {
  NotebookRecordSnapshot,
  NotebookSnapshot,
} from "@/lib/records/notebook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RecordsNotebookPanelProps = {
  authSession: AuthSessionSnapshot;
  notebook: NotebookSnapshot | null;
  isLoading: boolean;
  errorMessage: string | null;
  isDeleteSubmitting: boolean;
  deleteTarget: NotebookRecordSnapshot | null;
  onOpenCreate: () => void;
  onRequestEdit: (record: NotebookRecordSnapshot) => void;
  onRequestDelete: (record: NotebookRecordSnapshot) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
};

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7" />
      <path d="M7.25 7v10A2 2 0 0 0 9.25 19h5.5a2 2 0 0 0 2-2V7" />
      <path d="M10 10.5v5" />
      <path d="M14 10.5v5" />
    </svg>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 p-4"
        >
          <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-muted)]" />
          <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-[var(--surface-muted)]" />
        </div>
      ))}
    </div>
  );
}

export function RecordsNotebookPanel({
  authSession,
  notebook,
  isLoading,
  errorMessage,
  isDeleteSubmitting,
  deleteTarget,
  onOpenCreate,
  onRequestEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: RecordsNotebookPanelProps) {
  const summary = notebook?.summary ?? {
    totalRecordCount: 0,
    uniqueSpeciesCount: 0,
  };
  const records = notebook?.records ?? [];
  const isAuthenticated = authSession.status === "authenticated";
  const isCreateDisabled = isLoading || isDeleteSubmitting;

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {summary.totalRecordCount} 条记录 / {summary.uniqueSpeciesCount} 个鸟种
            </p>
            {isAuthenticated && authSession.assistantAccount ? (
              <p className="text-xs leading-5 text-[var(--text-secondary)]">
                当前账号：{authSession.assistantAccount}
              </p>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            {!isAuthenticated ? (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/75 p-4">
                <p className="text-sm leading-6 text-amber-900/90">
                  登录后可查看并管理个人观测记录。
                </p>
              </div>
            ) : isLoading ? (
              <LoadingRows />
            ) : errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
                <p className="text-sm leading-6 text-rose-900">{errorMessage}</p>
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/75 p-4">
                <p className="text-sm leading-6 text-amber-900/90">
                  当前还没有个人观测记录，点击下方按钮开始添加。
                </p>
              </div>
            ) : (
              records.map((record) => (
                <article
                  key={record.recordId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRequestEdit(record)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRequestEdit(record);
                    }
                  }}
                  className="cursor-pointer rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm transition-colors hover:border-emerald-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="break-words text-sm leading-6 text-[var(--text-secondary)]">
                        {record.observationDate} {record.observationTime} {record.birdPoint}
                      </p>
                      <p className="break-words text-base font-semibold leading-6 text-[var(--text-primary)]">
                        {record.speciesName}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`删除 ${record.speciesName} 记录`}
                      className={cn(
                        "h-9 w-9 shrink-0 text-[var(--text-secondary)]",
                        isDeleteSubmitting && deleteTarget?.recordId === record.recordId
                          ? "opacity-60"
                          : "",
                      )}
                      disabled={isDeleteSubmitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestDelete(record);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="flex justify-center pt-1">
            <Button
              type="button"
              onClick={onOpenCreate}
              disabled={isCreateDisabled}
              className="min-w-[9rem]"
            >
              新增记录
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && onCancelDelete()}>
        <DialogContent className="max-w-[20rem]">
          <DialogHeader>
            <DialogTitle>确认删除此记录？</DialogTitle>
            <DialogDescription>
              删除后将无法恢复，请确认是否继续。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelDelete}
              disabled={isDeleteSubmitting}
              className="w-full sm:w-full"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void onConfirmDelete();
              }}
              disabled={isDeleteSubmitting}
              className="w-full sm:w-full"
            >
              {isDeleteSubmitting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
