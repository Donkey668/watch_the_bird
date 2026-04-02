"use client";

import Image from "next/image";
import { useCallback, useRef, type ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type IdentifyUploadCardProps = {
  previewUrl: string | null;
  previewFileName: string | null;
  isLoading: boolean;
  onSelectFile: (file: File | null) => void;
};

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-10 w-10 text-emerald-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-1.6A2 2 0 0 1 10.8 4h2.4a2 2 0 0 1 1.6.8L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

export function IdentifyUploadCard({
  previewUrl,
  previewFileName,
  isLoading,
  onSelectFile,
}: IdentifyUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.currentTarget.files?.[0] ?? null;
      onSelectFile(nextFile);
      event.currentTarget.value = "";
    },
    [onSelectFile],
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            "relative block w-full overflow-hidden rounded-2xl border border-dashed border-emerald-200 bg-[linear-gradient(180deg,rgba(248,252,244,0.96),rgba(240,248,236,0.92))] text-left transition-colors hover:border-emerald-300 hover:bg-[linear-gradient(180deg,rgba(248,252,244,1),rgba(236,246,231,0.96))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]",
            isLoading && "border-emerald-300",
          )}
          aria-label="点击上传图片"
        >
          <div className="relative aspect-[4/3] w-full">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="待识别鸟类预览图"
                fill
                unoptimized
                sizes="(max-width: 430px) 100vw, 430px"
                className="object-contain p-3"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                <CameraIcon />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    点击上传图片
                  </p>
                  <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    支持本地单张图片，上传后将立即开始识别。
                  </p>
                </div>
              </div>
            )}
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        <p className="min-h-5 break-all text-xs leading-5 text-[var(--text-secondary)]">
          {previewFileName
            ? `当前图片：${previewFileName}`
            : "上传清晰的标准照可获得更稳定的识别结果。"}
        </p>
      </CardContent>
    </Card>
  );
}
