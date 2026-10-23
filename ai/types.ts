import type { UIMessage } from "ai";
import { z } from "zod";

/**
 * Message-level metadata for the streaming-data demo.
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
 */
export const streamingMessageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  finishedAt: z.number().optional(),
  /** Wall-clock generation duration in milliseconds. */
  durationMs: z.number().optional(),
  model: z.string().optional(),
  totalTokens: z.number().optional(),
});

export type StreamingMessageMetadata = z.infer<
  typeof streamingMessageMetadataSchema
>;

/**
 * Typed UI messages for the streaming-data demo.
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
 */
export type StreamingDataUIMessage = UIMessage<
  StreamingMessageMetadata,
  {
    weather: {
      city: string;
      weather?: string;
      status: "loading" | "success";
    };
    notification: {
      message: string;
      level: "info" | "warning" | "error";
    };
  }
>;
