import "server-only";

import OpenAI from "openai";
import {
  createUnavailableBirdingIndex,
  getBirdingModelName,
  isBirdingIndexLevel,
  type BirdingIndexAssessment,
  type DistrictWeatherSnapshot,
} from "@/lib/weather/birding-outlook";

const DASHSCOPE_BASE_URL =
  "https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1";

const BIRDING_INDEX_SYSTEM_PROMPT = [
  "\u4f60\u662f\u7528\u4e8e\u7f51\u9875\u76f4\u63a5\u6e32\u67d3\u7684\u89c2\u9e1f\u6307\u6570\u5224\u65ad\u670d\u52a1\u3002",
  "\u4f60\u53ea\u80fd\u8f93\u51fa JSON\uff0c\u4e0d\u5f97\u8f93\u51fa\u89e3\u91ca\u3001markdown\u3001\u4ee3\u7801\u5757\u3001\u5907\u6ce8\u6216\u989d\u5916\u5b57\u6bb5\u3002",
  '\u4f60\u53ea\u80fd\u8fd4\u56de {"birdingIndex":"\\u9002\\u5b9c"}\u3001{"birdingIndex":"\\u8f83\\u9002\\u5b9c"} \u6216 {"birdingIndex":"\\u4e0d\\u9002\\u5b9c"} \u4e4b\u4e00\u3002',
  "\u5224\u65ad\u89c4\u5219\uff1a",
  "1. \u82e5\u51fa\u73b0\u66b4\u96e8\u3001\u5927\u96e8\u3001\u96f7\u66b4\u3001\u5f3a\u5bf9\u6d41\u3001\u53f0\u98ce\u3001\u5927\u98ce\u3001\u6c99\u5c18\u3001\u91cd\u5ea6\u973e\u3001\u6781\u7aef\u9ad8\u6e29\u6216\u6781\u7aef\u4f4e\u6e29\u7b49\u660e\u663e\u4e0d\u5229\u6761\u4ef6\uff0c\u8f93\u51fa\u4e0d\u9002\u5b9c\u3002",
  "2. \u82e5\u5929\u6c14\u5e73\u7a33\u3001\u98ce\u529b\u8f83\u5c0f\u3001\u4f53\u611f\u8212\u9002\u3001\u9002\u5408\u6237\u5916\u89c2\u5bdf\uff0c\u8f93\u51fa\u9002\u5b9c\u3002",
  "3. \u82e5\u5b58\u5728\u5c0f\u96e8\u3001\u95f7\u70ed\u3001\u6e7f\u5ea6\u504f\u9ad8\u3001\u98ce\u529b\u504f\u5927\u6216\u5176\u4ed6\u8f7b\u5ea6\u4e0d\u5229\u56e0\u7d20\uff0c\u4f46\u4ecd\u53ef\u8fdb\u884c\u89c2\u9e1f\uff0c\u8f93\u51fa\u8f83\u9002\u5b9c\u3002",
  "4. \u5982\u679c\u4fe1\u606f\u4e0d\u5b8c\u6574\uff0c\u6309\u4fdd\u5b88\u539f\u5219\u5728\u8f83\u9002\u5b9c\u548c\u4e0d\u9002\u5b9c\u4e2d\u5224\u65ad\uff0c\u4f46\u7edd\u4e0d\u80fd\u8f93\u51fa\u5176\u4ed6\u503c\u3002",
  "5. \u8bf7\u4e25\u683c\u6309\u7167 JSON \u683c\u5f0f\u8f93\u51fa\u3002",
].join("\n");

type BirdingIndexModelOutput = {
  birdingIndex?: unknown;
};

type OpenAIResponseOutput = {
  output_text?: unknown;
};

function createOpenAIClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "\u7f3a\u5c11\u89c2\u9e1f\u6307\u6570\u670d\u52a1\u914d\u7f6e\u3002",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });
}

function buildBirdingIndexInput(snapshot: DistrictWeatherSnapshot) {
  return JSON.stringify(
    {
      districtName: snapshot.districtName,
      districtCode: snapshot.districtCode,
      weatherText: snapshot.weatherText,
      temperature: snapshot.temperature,
      humidity: snapshot.humidity,
      windDirection: snapshot.windDirection,
      windPower: snapshot.windPower,
      reportTime: snapshot.reportTime,
      weatherDetails: snapshot.details,
    },
    null,
    2,
  );
}

export async function assessBirdingIndex(
  snapshot: DistrictWeatherSnapshot,
): Promise<BirdingIndexAssessment> {
  const modelName = getBirdingModelName();

  try {
    const openai = createOpenAIClient();
    const response = (await openai.responses.create({
      model: modelName,
      instructions: BIRDING_INDEX_SYSTEM_PROMPT,
      input: buildBirdingIndexInput(snapshot),
      response_format: { type: "json_object" },
    } as never)) as OpenAIResponseOutput;

    const outputText =
      typeof response.output_text === "string" ? response.output_text.trim() : "";

    if (!outputText) {
      return createUnavailableBirdingIndex(
        modelName,
        "\u89c2\u9e1f\u6307\u6570\u8fd4\u56de\u5185\u5bb9\u4e3a\u7a7a\u3002",
      );
    }

    const parsed = JSON.parse(outputText) as BirdingIndexModelOutput;
    if (!isBirdingIndexLevel(parsed.birdingIndex)) {
      return createUnavailableBirdingIndex(
        modelName,
        "\u89c2\u9e1f\u6307\u6570\u8fd4\u56de\u4e86\u4e0d\u652f\u6301\u7684\u7b49\u7ea7\u503c\u3002",
      );
    }

    return {
      level: parsed.birdingIndex,
      status: "success",
      generatedAt: new Date().toISOString(),
      modelName,
      rawResult: parsed as Record<string, unknown>,
      failureReason: null,
    };
  } catch {
    return createUnavailableBirdingIndex(
      modelName,
      "\u89c2\u9e1f\u6307\u6570\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
    );
  }
}
