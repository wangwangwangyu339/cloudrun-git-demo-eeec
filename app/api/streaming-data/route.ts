import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  simulateReadableStream,
  streamText,
  toUIMessageStream,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { StreamingDataUIMessage } from "@/ai/types";

export const maxDuration = 30;

const emptyUsage = {
  inputTokens: {
    total: 8,
    noCache: 8,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 16,
    text: 16,
    reasoning: undefined,
  },
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractCity(text: string): string {
  const match =
    text.match(
      /(?:weather|气温|天气|forecast)\s+(?:in|at|for)\s+([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z\u4e00-\u9fff]+)?)/i,
    ) ??
    text.match(
      /\b(?:in|at|for)\s+([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z\u4e00-\u9fff]+)?)/i,
    );
  return (match?.[1] ?? "San Francisco").replace(/[?.!,]+$/, "").trim();
}

function lastUserText(messages: StreamingDataUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ");
  }
  return "";
}

function textChunksForCity(city: string) {
  const full = `Streaming-data demo: weather for ${city} is attached as a reconciled data part.`;
  return full.match(/\S+\s*/g) ?? [full];
}

function resolveModel(city: string) {
  if (process.env.AI_GATEWAY_API_KEY) {
    return {
      model: "anthropic/claude-sonnet-5.5" as const,
      modelId: "anthropic/claude-sonnet-5.5",
    };
  }

  const deltas = textChunksForCity(city);
  const modelId = "streaming-data-demo";

  return {
    modelId,
    model: new MockLanguageModelV4({
      provider: "demo",
      modelId,
      doStream: async () => {
        await sleep(350);
        return {
          stream: simulateReadableStream({
            initialDelayInMs: 80,
            chunkDelayInMs: 45,
            chunks: [
              { type: "text-start", id: "text-1" },
              ...deltas.map((delta) => ({
                type: "text-delta" as const,
                id: "text-1",
                delta,
              })),
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: { unified: "stop" as const, raw: undefined },
                usage: emptyUsage,
              },
            ],
          }),
        };
      },
    }),
  };
}

export async function POST(request: Request) {
  const { messages }: { messages: StreamingDataUIMessage[] } =
    await request.json();
  const city = extractCity(lastUserText(messages));
  const modelMessages = await convertToModelMessages(messages);
  const { model, modelId } = resolveModel(city);
  const startedAt = Date.now();

  const stream = createUIMessageStream<StreamingDataUIMessage>({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({
        type: "message-metadata",
        messageMetadata: {
          createdAt: startedAt,
          model: modelId,
        },
      });

      await sleep(160);

      writer.write({
        type: "data-notification",
        data: { message: "Processing your request...", level: "info" },
        transient: true,
      });

      await sleep(120);

      writer.write({
        type: "source-url",
        sourceId: "source-1",
        url: "https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data",
        title: "AI SDK Streaming Data guide",
      });

      await sleep(140);

      writer.write({
        type: "data-weather",
        id: "weather-1",
        data: { city, status: "loading" },
      });

      await sleep(220);

      const result = streamText({
        model,
        instructions:
          "You are a friendly assistant demoing AI SDK streaming data parts.",
        messages: modelMessages,
        async onFinish({ totalUsage }) {
          const modelFinishedAt = Date.now();
          const totalTokens =
            totalUsage?.totalTokens ??
            (totalUsage?.inputTokens ?? 0) + (totalUsage?.outputTokens ?? 0);

          // Intermediate metadata once the model stream ends.
          writer.write({
            type: "message-metadata",
            messageMetadata: {
              createdAt: startedAt,
              finishedAt: modelFinishedAt,
              durationMs: modelFinishedAt - startedAt,
              model: modelId,
              totalTokens: totalTokens || undefined,
            },
          });

          await sleep(280);
          writer.write({
            type: "data-weather",
            id: "weather-1",
            data: {
              city,
              weather: "sunny",
              status: "success",
            },
          });

          await sleep(100);
          writer.write({
            type: "data-notification",
            data: { message: "Request completed", level: "info" },
            transient: true,
          });

          // Final metadata includes post-stream data-part work (full 耗时).
          const finishedAt = Date.now();
          writer.write({
            type: "message-metadata",
            messageMetadata: {
              createdAt: startedAt,
              finishedAt,
              durationMs: finishedAt - startedAt,
              model: modelId,
              totalTokens: totalTokens || undefined,
            },
          });
        },
      });

      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          sendStart: false,
          originalMessages: messages,
          messageMetadata: ({ part }) => {
            if (part.type === "finish") {
              const finishedAt = Date.now();
              const usage = part.totalUsage;
              const totalTokens =
                usage?.totalTokens ??
                (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);

              return {
                createdAt: startedAt,
                finishedAt,
                durationMs: finishedAt - startedAt,
                model: modelId,
                totalTokens: totalTokens || undefined,
              };
            }
          },
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
