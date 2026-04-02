import "server-only";

import { getDashScopeClient } from "@/lib/ai/dashscope-client";
import {
  BIRD_IDENTIFY_MODEL_NAME,
  ENCYCLOPEDIA_SECTION_KEYS,
  ENCYCLOPEDIA_SUCCESS_MESSAGE,
  ENCYCLOPEDIA_UNAVAILABLE_MESSAGE,
  createEncyclopediaSection,
  createSuccessfulBirdEncyclopedia,
  type BirdRecognitionResult,
  type BirdEncyclopediaSummary,
} from "@/lib/identify/identify-contract";

const ENCYCLOPEDIA_SYSTEM_PROMPT = [
  "你是一名严谨的鸟类百科整理助手。",
  "你会根据已经识别出的鸟种名称整理可直接渲染的简介内容。",
  "你必须直接输出 JSON 对象，不要输出 Markdown、解释、前后缀、标题或列表符号。",
  "返回的 JSON 必须严格包含 traits、habits、distribution、protection 四个字符串字段。",
  "traits 对应物种特征，habits 对应生活习性，distribution 对应分布区域，protection 对应保护级别。",
  "每个字段都必须是简体中文、干净、可直接展示的完整句子。",
  "protection 必须同时覆盖国内保护和世界濒危等级。",
  "不要输出括号中的补充说明，不要输出空字段。",
  `成功时请让内容适合前端直接展示，message 由服务端固定为：${ENCYCLOPEDIA_SUCCESS_MESSAGE}`,
].join("\n");

function normalizeSectionText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function removeParentheticalContent(value: string) {
  return normalizeSectionText(value)
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([，。；：])/g, "$1")
    .trim();
}

function buildEncyclopediaPrompt(recognition: Extract<BirdRecognitionResult, { status: "success" }>) {
  return [
    "请根据以下鸟种信息输出 JSON：",
    `简体中文名：${recognition.speciesNameZh}`,
    `英文学名：${recognition.speciesNameEn}`,
    `拉丁学名：${recognition.speciesNameLa}`,
    '输出格式示例：{"traits":"...","habits":"...","distribution":"...","protection":"..."}',
  ].join("\n");
}

function parseEncyclopediaPayload(content: string) {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const rawTraits = typeof parsed.traits === "string" ? parsed.traits : "";
  const rawHabits = typeof parsed.habits === "string" ? parsed.habits : "";
  const rawDistribution =
    typeof parsed.distribution === "string" ? parsed.distribution : "";
  const rawProtection =
    typeof parsed.protection === "string" ? parsed.protection : "";

  const traits = normalizeSectionText(rawTraits);
  const habits = normalizeSectionText(rawHabits);
  const distribution = normalizeSectionText(rawDistribution);
  const protection = removeParentheticalContent(rawProtection);

  if (!traits || !habits || !distribution || !protection) {
    throw new Error("Bird encyclopedia returned incomplete sections.");
  }

  return {
    traits,
    habits,
    distribution,
    protection,
  };
}

export async function generateBirdEncyclopedia(
  recognition: Extract<BirdRecognitionResult, { status: "success" }>,
): Promise<BirdEncyclopediaSummary> {
  const client = getDashScopeClient();
  const completion = await client.chat.completions.create({
    model: BIRD_IDENTIFY_MODEL_NAME,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: ENCYCLOPEDIA_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildEncyclopediaPrompt(recognition),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Bird encyclopedia returned an empty response.");
  }

  const payload = parseEncyclopediaPayload(content);
  const sections = ENCYCLOPEDIA_SECTION_KEYS.map((key) =>
    createEncyclopediaSection(key, payload[key]),
  );

  return createSuccessfulBirdEncyclopedia({
    sections,
    modelName: BIRD_IDENTIFY_MODEL_NAME,
  });
}

export function createUnavailableBirdEncyclopedia(
  message = ENCYCLOPEDIA_UNAVAILABLE_MESSAGE,
): BirdEncyclopediaSummary {
  return {
    status: "unavailable",
    message,
    modelName: BIRD_IDENTIFY_MODEL_NAME,
    sections: [],
  };
}
