import "server-only";

import type { ChatCompletionContentPartImage } from "openai/resources/chat/completions/completions";
import { getDashScopeClient } from "@/lib/ai/dashscope-client";
import type { PreparedUploadedBirdImage } from "@/lib/identify/image-upload";
import {
  BIRD_IDENTIFY_MODEL_NAME,
  RECOGNIZED_BIRD_MESSAGE,
  UNRECOGNIZED_BIRD_MESSAGE,
  createSuccessfulRecognition,
  createUnrecognizedRecognition,
  type BirdRecognitionResult,
} from "@/lib/identify/identify-contract";

const RECOGNITION_SYSTEM_PROMPT = [
  "你是一名严谨的鸟类图片识别助手。",
  "用户提供的图片拍摄地点为中国广东省深圳市。",
  "请只根据用户提供的图片判断是否存在一个可稳定识别的主要鸟类主体。",
  "你必须直接输出 JSON 对象，不要输出 Markdown、解释、前后缀或额外文字。",
  "如果图片中没有鸟类主体、主体过小、存在多只鸟且无法稳定判断、画面模糊或不足以可靠识别，请返回未识别结果，不要猜测。",
  `未识别结果必须使用固定 message：${UNRECOGNIZED_BIRD_MESSAGE}`,
  "识别成功时必须返回 status、speciesNameZh、speciesNameEn、speciesNameLa、message 五个字段。",
  `识别成功时 message 固定为：${RECOGNIZED_BIRD_MESSAGE}`,
  "speciesNameZh 必须为简体中文名，speciesNameEn 为英文名，speciesNameLa 为拉丁学名。",
  "如果任一学名无法可靠给出，也必须返回未识别结果。",
].join("\n");

const RECOGNITION_USER_PROMPT = [
  "请识别图片中的主要鸟类，并按 JSON 格式输出。",
  "输出示例：",
  '{"status":"success","speciesNameZh":"白鹭","speciesNameEn":"Little Egret","speciesNameLa":"Egretta garzetta","message":"已识别到可参考的鸟种信息。"}',
  "或：",
  `{"status":"unrecognized","speciesNameZh":null,"speciesNameEn":null,"speciesNameLa":null,"message":"${UNRECOGNIZED_BIRD_MESSAGE}"}`,
].join("\n");

function normalizeStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseRecognitionPayload(
  content: string,
): BirdRecognitionResult {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const status = normalizeStringValue(parsed.status);
  const speciesNameZh = normalizeStringValue(parsed.speciesNameZh);
  const speciesNameEn = normalizeStringValue(parsed.speciesNameEn);
  const speciesNameLa = normalizeStringValue(parsed.speciesNameLa);
  const message = normalizeStringValue(parsed.message);

  if (status === "success" && speciesNameZh && speciesNameEn && speciesNameLa) {
    return createSuccessfulRecognition({
      speciesNameZh,
      speciesNameEn,
      speciesNameLa,
      modelName: BIRD_IDENTIFY_MODEL_NAME,
      message: RECOGNIZED_BIRD_MESSAGE,
    });
  }

  if (status === "unrecognized" || message === UNRECOGNIZED_BIRD_MESSAGE) {
    return createUnrecognizedRecognition(BIRD_IDENTIFY_MODEL_NAME);
  }

  return createUnrecognizedRecognition(BIRD_IDENTIFY_MODEL_NAME);
}

function createImageContentPart(
  image: PreparedUploadedBirdImage,
): ChatCompletionContentPartImage {
  return {
    type: "image_url",
    image_url: {
      url: image.imageUrl,
    },
  };
}

export async function recognizeBirdFromImage(
  image: PreparedUploadedBirdImage,
): Promise<BirdRecognitionResult> {
  const client = getDashScopeClient();

  const completion = await client.chat.completions.create({
    model: BIRD_IDENTIFY_MODEL_NAME,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: RECOGNITION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          createImageContentPart(image),
          {
            type: "text",
            text: RECOGNITION_USER_PROMPT,
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Bird recognition returned an empty response.");
  }

  return parseRecognitionPayload(content);
}
