"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createIdentifyFailedResponse,
  type BirdIdentifyResponse,
} from "@/lib/identify/identify-contract";
import { IdentifyEncyclopediaCard } from "./identify-encyclopedia-card";
import { IdentifyResultCard } from "./identify-result-card";
import { IdentifyUploadCard } from "./identify-upload-card";

export function IdentifyScreen() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [response, setResponse] = useState<BirdIdentifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestVersionRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);

  const replacePreviewUrl = useCallback((nextPreviewUrl: string | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  }, []);

  useEffect(() => {
    return () => {
      requestVersionRef.current += 1;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleSelectFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      const nextPreviewUrl = URL.createObjectURL(file);
      replacePreviewUrl(nextPreviewUrl);
      setPreviewFileName(file.name);
      setResponse(null);

      const requestVersion = ++requestVersionRef.current;
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.set("image", file);

        const result = await fetch("/api/identify/bird-recognition", {
          method: "POST",
          body: formData,
          cache: "no-store",
        });

        const payload = (await result.json()) as BirdIdentifyResponse;
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setResponse(payload);
      } catch {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setResponse(createIdentifyFailedResponse(new Date().toISOString()));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
        }
      }
    },
    [replacePreviewUrl],
  );

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          鸟影识别
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          鸟类识别工具
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          上传一张清晰的鸟类照片，识别当前画面中的主要鸟种。
        </p>
      </header>

      <IdentifyUploadCard
        previewUrl={previewUrl}
        previewFileName={previewFileName}
        isLoading={isLoading}
        onSelectFile={handleSelectFile}
      />

      {(previewUrl || response || isLoading) ? (
        <IdentifyResultCard response={response} isLoading={isLoading} />
      ) : null}

      {!isLoading && response?.encyclopedia ? (
        <IdentifyEncyclopediaCard
          sections={response.encyclopedia.sections}
          message={
            response.encyclopedia.status === "unavailable"
              ? response.encyclopedia.message
              : null
          }
        />
      ) : null}

      <p className="px-2 text-center text-xs leading-5 text-[var(--text-secondary)]">
        识别结果仅供参考。鸟类图片越接近标准照，准确率越高。
      </p>
    </div>
  );
}
