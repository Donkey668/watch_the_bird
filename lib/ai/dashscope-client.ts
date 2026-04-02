import "server-only";

import OpenAI from "openai";

export const DASHSCOPE_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

let dashScopeClient: OpenAI | null = null;

export function getDashScopeApiKey() {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is not configured.");
  }

  return apiKey;
}

export function getDashScopeClient() {
  if (dashScopeClient) {
    return dashScopeClient;
  }

  dashScopeClient = new OpenAI({
    apiKey: getDashScopeApiKey(),
    baseURL: DASHSCOPE_BASE_URL,
  });

  return dashScopeClient;
}
