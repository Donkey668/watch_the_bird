"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AUTH_DIALOG_COPY = {
  close: "关闭",
  loginTitle: "登录",
  loginDescription: "请输入助手账号和用户密码，完成当前页面的登录验证。",
  assistantAccountLabel: "助手账号",
  assistantAccountPlaceholder: "请输入助手账号",
  userPasswordLabel: "用户密码",
  userPasswordPlaceholder: "请输入用户密码",
  cancel: "取消",
  submitIdle: "确认登录",
  submitPending: "登录中...",
  registerTitle: "注册",
  registerDescription: "请联系管理员注册与登录",
  registerAcknowledge: "知道了",
  avatarAlt: "默认管理员头像",
} as const;

export type AuthDialogMode = "login" | "register" | null;

type LoginSubmitPayload = {
  assistantAccount: string;
  userPassword: string;
};

type LoginRegisterDialogProps = {
  mode: AuthDialogMode;
  isSubmitting: boolean;
  loginError: string | null;
  onClose: () => void;
  onLoginSubmit: (payload: LoginSubmitPayload) => Promise<void>;
};

type LoginDialogPanelProps = {
  isSubmitting: boolean;
  loginError: string | null;
  onLoginSubmit: (payload: LoginSubmitPayload) => Promise<void>;
};

function CloseCrossIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-rose-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5 15 15" />
      <path d="M15 5 5 15" />
    </svg>
  );
}

function LoginDialogPanel({
  isSubmitting,
  loginError,
  onLoginSubmit,
}: LoginDialogPanelProps) {
  const [assistantAccount, setAssistantAccount] = useState("");
  const [userPassword, setUserPassword] = useState("");

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLoginSubmit({
      assistantAccount,
      userPassword,
    });
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg">
            {AUTH_DIALOG_COPY.loginTitle}
          </DialogTitle>
          <DialogDescription>
            {AUTH_DIALOG_COPY.loginDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-rose-50"
            disabled={isSubmitting}
          >
            <CloseCrossIcon />
            <span className="sr-only">{AUTH_DIALOG_COPY.close}</span>
          </Button>
        </DialogClose>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="assistant-account"
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {AUTH_DIALOG_COPY.assistantAccountLabel}
          </label>
          <Input
            id="assistant-account"
            name="assistantAccount"
            autoComplete="username"
            placeholder={AUTH_DIALOG_COPY.assistantAccountPlaceholder}
            value={assistantAccount}
            onChange={(event) => setAssistantAccount(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="user-password"
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {AUTH_DIALOG_COPY.userPasswordLabel}
          </label>
          <Input
            id="user-password"
            name="userPassword"
            type="password"
            autoComplete="current-password"
            placeholder={AUTH_DIALOG_COPY.userPasswordPlaceholder}
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {loginError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">
            {loginError}
          </div>
        ) : null}

        <DialogFooter className="gap-2 pt-1">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-full"
              disabled={isSubmitting}
            >
              {AUTH_DIALOG_COPY.cancel}
            </Button>
          </DialogClose>
          <Button type="submit" className="w-full sm:w-full" disabled={isSubmitting}>
            {isSubmitting
              ? AUTH_DIALOG_COPY.submitPending
              : AUTH_DIALOG_COPY.submitIdle}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}

export function LoginRegisterDialog({
  mode,
  isSubmitting,
  loginError,
  onClose,
  onLoginSubmit,
}: LoginRegisterDialogProps) {
  const isOpen = mode !== null;
  const isLoginMode = mode === "login";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="w-[calc(100%-1.5rem)] max-w-[22rem] gap-0 overflow-hidden rounded-[1.5rem] p-0"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
      >
        {isLoginMode ? (
          <LoginDialogPanel
            key="login"
            isSubmitting={isSubmitting}
            loginError={loginError}
            onLoginSubmit={onLoginSubmit}
          />
        ) : (
          <div className="p-5">
            <div className="relative">
              <DialogHeader className="mx-auto items-center space-y-3 text-center">
                <Image
                  src="/images/default-admin-avatar.png"
                  alt={AUTH_DIALOG_COPY.avatarAlt}
                  width={84}
                  height={84}
                  className="rounded-full border border-emerald-100 bg-emerald-50"
                  priority
                />
                <div className="space-y-2">
                  <DialogTitle className="text-lg">
                    {AUTH_DIALOG_COPY.registerTitle}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-6">
                    {AUTH_DIALOG_COPY.registerDescription}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-rose-50"
                >
                  <CloseCrossIcon />
                  <span className="sr-only">{AUTH_DIALOG_COPY.close}</span>
                </Button>
              </DialogClose>
            </div>

            <DialogFooter className="pt-5">
              <DialogClose asChild>
                <Button type="button" className="w-full sm:w-full">
                  {AUTH_DIALOG_COPY.registerAcknowledge}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
