export const BIRD_IDENTIFY_MODEL_NAME = "qwen3.6-plus";
export const UNRECOGNIZED_BIRD_MESSAGE = "图片中未包含可识别的鸟类！";
export const INVALID_IMAGE_MESSAGE = "请上传有效的图片文件。";
export const IDENTIFY_FAILED_MESSAGE =
  "鸟类识别服务暂时不可用，请稍后重试。";
export const IDENTIFY_SUCCESS_MESSAGE = "鸟类识别结果已更新。";
export const IDENTIFY_PARTIAL_MESSAGE = "鸟类已识别，但百科简介暂时不可用。";
export const RECOGNIZED_BIRD_MESSAGE = "已识别到可参考的鸟种信息。";
export const ENCYCLOPEDIA_SUCCESS_MESSAGE = "鸟类百科简介已生成。";
export const ENCYCLOPEDIA_UNAVAILABLE_MESSAGE = "鸟类百科简介暂时不可用。";

export const IDENTIFY_RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

export const ENCYCLOPEDIA_SECTION_KEYS = [
  "traits",
  "habits",
  "distribution",
  "protection",
] as const;

export type EncyclopediaSectionKey = (typeof ENCYCLOPEDIA_SECTION_KEYS)[number];
export type IdentifyRequestStatus =
  | "success"
  | "partial"
  | "invalid_image"
  | "unrecognized"
  | "failed";
export type BirdRecognitionStatus = "success" | "unrecognized" | "failed";
export type BirdEncyclopediaStatus = "success" | "unavailable";

export type EncyclopediaSection = {
  key: EncyclopediaSectionKey;
  label: string;
  content: string;
};

export type BirdRecognitionResult =
  | {
      status: "success";
      speciesNameZh: string;
      speciesNameEn: string;
      speciesNameLa: string;
      message: string;
      modelName: string;
    }
  | {
      status: "unrecognized" | "failed";
      speciesNameZh: null;
      speciesNameEn: null;
      speciesNameLa: null;
      message: string;
      modelName: string;
    };

export type BirdEncyclopediaSummary = {
  status: BirdEncyclopediaStatus;
  message: string;
  modelName: string;
  sections: EncyclopediaSection[];
};

export type BirdIdentifyResponse = {
  requestStatus: IdentifyRequestStatus;
  message: string;
  requestedAt: string;
  recognition: BirdRecognitionResult | null;
  encyclopedia: BirdEncyclopediaSummary | null;
};

const ENCYCLOPEDIA_SECTION_LABELS: Record<EncyclopediaSectionKey, string> = {
  traits: "物种特征",
  habits: "生活习性",
  distribution: "分布区域",
  protection: "保护级别",
};

function normalizeText(value: string) {
  return value.trim();
}

export function createEncyclopediaSection(
  key: EncyclopediaSectionKey,
  content: string,
): EncyclopediaSection {
  return {
    key,
    label: ENCYCLOPEDIA_SECTION_LABELS[key],
    content: normalizeText(content),
  };
}

export function createSuccessfulRecognition(params: {
  speciesNameZh: string;
  speciesNameEn: string;
  speciesNameLa: string;
  modelName?: string;
  message?: string;
}): BirdRecognitionResult {
  return {
    status: "success",
    speciesNameZh: normalizeText(params.speciesNameZh),
    speciesNameEn: normalizeText(params.speciesNameEn),
    speciesNameLa: normalizeText(params.speciesNameLa),
    message: params.message ?? RECOGNIZED_BIRD_MESSAGE,
    modelName: params.modelName ?? BIRD_IDENTIFY_MODEL_NAME,
  };
}

export function createSuccessfulBirdEncyclopedia(params: {
  sections: EncyclopediaSection[];
  modelName?: string;
  message?: string;
}): BirdEncyclopediaSummary {
  return {
    status: "success",
    message: params.message ?? ENCYCLOPEDIA_SUCCESS_MESSAGE,
    modelName: params.modelName ?? BIRD_IDENTIFY_MODEL_NAME,
    sections: params.sections,
  };
}

export function createUnrecognizedRecognition(
  modelName = BIRD_IDENTIFY_MODEL_NAME,
): BirdRecognitionResult {
  return {
    status: "unrecognized",
    speciesNameZh: null,
    speciesNameEn: null,
    speciesNameLa: null,
    message: UNRECOGNIZED_BIRD_MESSAGE,
    modelName,
  };
}

export function createFailedRecognition(
  message = IDENTIFY_FAILED_MESSAGE,
  modelName = BIRD_IDENTIFY_MODEL_NAME,
): BirdRecognitionResult {
  return {
    status: "failed",
    speciesNameZh: null,
    speciesNameEn: null,
    speciesNameLa: null,
    message,
    modelName,
  };
}

export function createIdentifySuccessResponse(
  requestedAt: string,
  recognition: BirdRecognitionResult,
  encyclopedia: BirdEncyclopediaSummary,
): BirdIdentifyResponse {
  return {
    requestStatus: "success",
    message:
      recognition.status === "success"
        ? IDENTIFY_SUCCESS_MESSAGE
        : UNRECOGNIZED_BIRD_MESSAGE,
    requestedAt,
    recognition,
    encyclopedia,
  };
}

export function createIdentifyPartialResponse(
  requestedAt: string,
  recognition: BirdRecognitionResult,
  encyclopedia: BirdEncyclopediaSummary,
): BirdIdentifyResponse {
  return {
    requestStatus: "partial",
    message: IDENTIFY_PARTIAL_MESSAGE,
    requestedAt,
    recognition,
    encyclopedia,
  };
}

export function createInvalidImageIdentifyResponse(
  requestedAt: string,
  message = INVALID_IMAGE_MESSAGE,
): BirdIdentifyResponse {
  return {
    requestStatus: "invalid_image",
    message,
    requestedAt,
    recognition: null,
    encyclopedia: null,
  };
}

export function createIdentifyUnrecognizedResponse(
  requestedAt: string,
  recognition = createUnrecognizedRecognition(),
): BirdIdentifyResponse {
  return {
    requestStatus: "unrecognized",
    message: UNRECOGNIZED_BIRD_MESSAGE,
    requestedAt,
    recognition,
    encyclopedia: null,
  };
}

export function createIdentifyFailedResponse(
  requestedAt: string,
  message = IDENTIFY_FAILED_MESSAGE,
): BirdIdentifyResponse {
  return {
    requestStatus: "failed",
    message,
    requestedAt,
    recognition: null,
    encyclopedia: null,
  };
}

export function hasSuccessfulRecognition(
  response: BirdIdentifyResponse | null,
): response is BirdIdentifyResponse & {
  recognition: Extract<BirdRecognitionResult, { status: "success" }>;
} {
  return response?.recognition?.status === "success";
}
