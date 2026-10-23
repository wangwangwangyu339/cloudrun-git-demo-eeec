"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Stock } from "@/components/stock";
import { Weather } from "@/components/weather";

/**
 * Generative UI demo based on:
 * https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
 *
 * Tool results (`tool-displayWeather`, `tool-getStockPrice`) are mapped to React components.
 */
export default function GenerativeUIPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
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
    <main className="gui">
      <header className="gui__header">
        <p className="gui__brand">Generative UI</p>
        <p className="gui__lede">
          Ask about weather or a stock ticker — the model calls a tool, and we
          render a React card from the result.
        </p>
        <p className="gui__meta">
          Based on the{" "}
          <a
            href="https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces"
            target="_blank"
            rel="noreferrer"
          >
            AI SDK generative UI guide
          </a>
          . Without <code>AI_GATEWAY_API_KEY</code>, a local demo model drives
          the tools.
        </p>
        <p className="gui__build" data-build="vercel-flow-20261022b">
          Build mark: <code>vercel-flow-20261022b</code> — used to confirm
          preview deploys.
        </p>
        <p className="gui__hint">
          Tip: one message can ask for weather and a ticker; tool cards appear
          in the thread.
        </p>
      </header>

      <div className="gui__prompts">
        {[
          "What's the weather in Shanghai?",
          "上海今天天气怎么样？",
          "Show me the weather in Tokyo",
          "What's the price of AAPL?",
          "查一下 NVDA 股价",
          "Get stock price for NVDA",
        ].map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="gui__chip"
            disabled={busy}
            onClick={() => {
              sendMessage({ text: prompt });
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <section className="gui__thread" aria-live="polite">
        {messages.length === 0 ? (
          <p className="gui__empty">
            Send a message to see tool → component rendering.
          </p>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className={`gui__message gui__message--${message.role}`}
          >
            <div className="gui__role">
              {message.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="gui__parts">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={`${message.id}-text-${index}`} className="gui__text">
                      {part.text}
                    </p>
                  );
                }

                if (part.type === "tool-displayWeather") {
                  switch (part.state) {
                    case "input-available":
                      return (
                        <div
                          key={`${message.id}-weather-${index}`}
                          className="gui__loading"
                        >
                          Loading weather…
                        </div>
                      );
                    case "output-available": {
                      const output = part.output as {
                        temperature: number;
                        weather: string;
                        location: string;
                      };
                      return (
                        <div key={`${message.id}-weather-${index}`}>
                          <Weather {...output} />
                        </div>
                      );
                    }
                    case "output-error":
                      return (
                        <div
                          key={`${message.id}-weather-${index}`}
                          className="gui__error"
                        >
                          Error: {part.errorText}
                        </div>
                      );
                    default:
                      return null;
                  }
                }

                if (part.type === "tool-getStockPrice") {
                  switch (part.state) {
                    case "input-available":
                      return (
                        <div
                          key={`${message.id}-stock-${index}`}
                          className="gui__loading"
                        >
                          Loading stock price…
                        </div>
                      );
                    case "output-available": {
                      const output = part.output as {
                        price: number;
                        symbol: string;
                      };
                      return (
                        <div key={`${message.id}-stock-${index}`}>
                          <Stock {...output} />
                        </div>
                      );
                    }
                    case "output-error":
                      return (
                        <div
                          key={`${message.id}-stock-${index}`}
                          className="gui__error"
                        >
                          Error: {part.errorText}
                        </div>
                      );
                    default:
                      return null;
                  }
                }

                return null;
              })}
            </div>
          </article>
        ))}
      </section>

      {error ? (
        <p className="gui__error" role="alert">
          {error.message}
        </p>
      ) : null}

      <form className="gui__composer" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
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
