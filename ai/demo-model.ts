import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { LanguageModelV4Prompt } from "@ai-sdk/provider";

const emptyUsage = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 20,
    text: 20,
    reasoning: undefined,
  },
};

function lastUserText(prompt: LanguageModelV4Prompt): string {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const message = prompt[i];
    if (message.role !== "user") continue;
    if (typeof message.content === "string") return message.content;
    return message.content
      .filter((part) => part.type === "text")
      .map((part) => ("text" in part ? part.text : ""))
      .join(" ");
  }
  return "";
}

function hasToolResult(prompt: LanguageModelV4Prompt): boolean {
  return prompt.some((message) => {
    if (message.role === "tool") return true;
    if (!Array.isArray(message.content)) return false;
    return message.content.some((part) => part.type === "tool-result");
  });
}

function extractLocation(text: string): string {
  const match =
    text.match(
      /(?:weather|气温|天气|forecast)\s+(?:in|at|for)\s+([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z\u4e00-\u9fff]+)?)/i,
    ) ??
    text.match(
      /\b(?:in|at|for)\s+([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z\u4e00-\u9fff]+)?)/i,
    );
  return (match?.[1] ?? "Shanghai").replace(/[?.!,]+$/, "").trim();
}

function extractSymbol(text: string): string {
  const match = text.match(/\b([A-Z]{1,5})\b/) ?? text.match(/([A-Za-z]{1,5})/);
  return (match?.[1] ?? "AAPL").toUpperCase();
}

/**
 * Deterministic mock model for local demos without an AI Gateway key.
 * Routes weather/stock intents to tools, then replies with short text.
 */
export function createDemoModel() {
  return new MockLanguageModelV4({
    provider: "demo",
    modelId: "generative-ui-demo",
    doStream: async ({ prompt }) => {
      if (hasToolResult(prompt)) {
        return {
          stream: simulateReadableStream({
            chunkDelayInMs: 0,
            chunks: [
              { type: "text-start", id: "text-1" },
              {
                type: "text-delta",
                id: "text-1",
                delta: "Here is the live UI card from the tool result.",
              },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: undefined },
                usage: emptyUsage,
              },
            ],
          }),
        };
      }

      const text = lastUserText(prompt);
      const lower = text.toLowerCase();
      const wantsWeather =
        /weather|气温|天气|温度|forecast|sunny|rain/.test(lower) ||
        /天气|气温/.test(text);
      const wantsStock =
        /stock|股价|股票|share|ticker|nasdaq|price of/.test(lower) ||
        /\b(aapl|tsla|msft|nvda|goog)\b/i.test(text);

      if (wantsWeather) {
        const location = extractLocation(text);
        return {
          stream: simulateReadableStream({
            chunkDelayInMs: 0,
            chunks: [
              {
                type: "tool-call",
                toolCallId: "call-weather-1",
                toolName: "displayWeather",
                input: JSON.stringify({ location }),
              },
              {
                type: "finish",
                finishReason: { unified: "tool-calls", raw: undefined },
                usage: emptyUsage,
              },
            ],
          }),
        };
      }

      if (wantsStock) {
        const symbol = extractSymbol(text);
        return {
          stream: simulateReadableStream({
            chunkDelayInMs: 0,
            chunks: [
              {
                type: "tool-call",
                toolCallId: "call-stock-1",
                toolName: "getStockPrice",
                input: JSON.stringify({ symbol }),
              },
              {
                type: "finish",
                finishReason: { unified: "tool-calls", raw: undefined },
                usage: emptyUsage,
              },
            ],
          }),
        };
      }

      return {
        stream: simulateReadableStream({
          chunkDelayInMs: 0,
          chunks: [
            { type: "text-start", id: "text-1" },
            {
              type: "text-delta",
              id: "text-1",
              delta:
                "Try asking about the weather in a city, or a stock ticker like AAPL — I’ll render a UI card.",
            },
            { type: "text-end", id: "text-1" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: undefined },
              usage: emptyUsage,
            },
          ],
        }),
      };
    },
  });
}
