import "server-only";

import {
  INVALID_IMAGE_MESSAGE,
} from "@/lib/identify/identify-contract";

const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;

export type PreparedUploadedBirdImage = {
  fileName: string;
  mimeType: string;
  byteSize: number;
  imageUrl: string;
};

type PreparedImageResult =
  | {
      ok: true;
      value: PreparedUploadedBirdImage;
    }
  | {
      ok: false;
      message: string;
    };

function isFileEntry(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function createInvalidImageResult(message = INVALID_IMAGE_MESSAGE): PreparedImageResult {
  return {
    ok: false,
    message,
  };
}

export async function prepareUploadedBirdImage(
  value: FormDataEntryValue | null,
): Promise<PreparedImageResult> {
  if (!isFileEntry(value)) {
    return createInvalidImageResult();
  }

  const mimeType = value.type.trim();
  if (!mimeType.startsWith("image/")) {
    return createInvalidImageResult();
  }

  if (value.size <= 0) {
    return createInvalidImageResult();
  }

  if (value.size > MAX_IMAGE_FILE_BYTES) {
    return createInvalidImageResult("图片文件不能超过 10MB。");
  }

  const buffer = Buffer.from(await value.arrayBuffer());
  if (buffer.length === 0) {
    return createInvalidImageResult();
  }

  return {
    ok: true,
    value: {
      fileName: value.name || "uploaded-bird-image",
      mimeType,
      byteSize: value.size,
      imageUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
    },
  };
}
