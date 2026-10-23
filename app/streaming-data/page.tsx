"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { StreamingDataUIMessage } from "@/ai/types";

/**
 * Streaming data demo based on:
 * https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
 * https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
 *
 * - Persistent `data-weather` parts (loading → success reconciliation)
 * - `source-url` parts
 * - Transient `data-notification` via `onData` only
 * - Message metadata: model, tokens, durationMs (耗时)
 */

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
export default function StreamingDataPage() {
  const [input, setInput] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    level: "info" | "warning" | "error";
  } | null>(null);

  const { messages, sendMessage, status, error } =
    useChat<StreamingDataUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/streaming-data" }),
      onData: (dataPart) => {
        if (dataPart.type === "data-notification") {
          setNotification(dataPart.data);
        }
      },
    });

  const busy = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <main className="sd">
      <header className="sd__header">
        <p className="sd__brand">Streaming Data</p>
        <p className="sd__lede">
          Extra UI message parts stream beside model text: weather data
          (reconciled), sources, transient toasts, plus message metadata
          (model / tokens / 耗时).
        </p>
        <p className="sd__meta">
          Based on the{" "}
          <a
            href="https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data"
            target="_blank"
            rel="noreferrer"
          >
            streaming data
          </a>{" "}
          and{" "}
          <a
            href="https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata"
            target="_blank"
            rel="noreferrer"
          >
            message metadata
          </a>{" "}
          guides. Build mark: <code>streaming-data-metadata</code>
        </p>
      </header>

      {notification ? (
        <div
          className={`sd__toast sd__toast--${notification.level}`}
          role="status"
        >
          {notification.message}
        </div>
      ) : null}

      <div className="sd__prompts">
        {[
          "What's the weather in San Francisco?",
          "Ask about weather in Tokyo",
          "上海天气怎么样？",
        ].map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="sd__chip"
            disabled={busy}
            onClick={() => sendMessage({ text: prompt })}
          >
            {prompt}
          </button>
        ))}
      </div>

      <section className="sd__thread" aria-live="polite">
        {messages.length === 0 ? (
          <p className="sd__empty">
            Send a message to stream data parts + text.
          </p>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className={`sd__message sd__message--${message.role}`}
          >
            <div className="sd__role">
              <span>{message.role === "user" ? "You" : "Assistant"}</span>
              {message.metadata?.createdAt ? (
                <span className="sd__role-time">
                  {new Date(message.metadata.createdAt).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            <div className="sd__parts">
              {message.parts.map((part, index) => {
                if (part.type === "data-weather") {
                  return (
                    <div
                      key={`${message.id}-weather-${index}`}
                      className="sd__weather"
                    >
                      <strong>{part.data.city}</strong>
                      {part.data.status === "loading" ? (
                        <span>Getting weather…</span>
                      ) : (
                        <span>Weather: {part.data.weather}</span>
                      )}
                    </div>
                  );
                }

                if (part.type === "source-url") {
                  return (
                    <p
                      key={`${message.id}-source-${index}`}
                      className="sd__source"
                    >
                      Source:{" "}
                      <a href={part.url} target="_blank" rel="noreferrer">
                        {part.title ?? part.url}
                      </a>
                    </p>
                  );
                }

                if (part.type === "text") {
                  return (
                    <p key={`${message.id}-text-${index}`} className="sd__text">
                      {part.text}
                    </p>
                  );
                }

                return null;
              })}

              {message.role === "assistant" && message.metadata ? (
                <dl className="sd__metadata">
                  {message.metadata.model ? (
                    <>
                      <dt>Model</dt>
                      <dd>{message.metadata.model}</dd>
                    </>
                  ) : null}
                  {typeof message.metadata.durationMs === "number" ? (
                    <>
                      <dt>耗时</dt>
                      <dd>{formatDuration(message.metadata.durationMs)}</dd>
                    </>
                  ) : null}
                  {typeof message.metadata.totalTokens === "number" ? (
                    <>
                      <dt>Tokens</dt>
                      <dd>{message.metadata.totalTokens}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {error ? (
        <p className="sd__error" role="alert">
          {error.message}
        </p>
      ) : null}

      <form className="sd__composer" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the weather…"
          disabled={busy}
          aria-label="Message"
        />
        <button type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
