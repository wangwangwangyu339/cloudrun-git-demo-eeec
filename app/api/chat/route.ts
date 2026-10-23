import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { createDemoModel } from "@/ai/demo-model";
import { tools } from "@/ai/tools";

export const maxDuration = 30;

function resolveModel() {
  // Prefer Vercel AI Gateway when configured; otherwise use the local demo model.
  if (process.env.AI_GATEWAY_API_KEY) {
    return "anthropic/claude-sonnet-5.5";
  }
  return createDemoModel();
}

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: resolveModel(),
    instructions:
      "You are a friendly assistant that can show weather and stock UI cards. Prefer calling tools when the user asks about weather or stock prices.",
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
