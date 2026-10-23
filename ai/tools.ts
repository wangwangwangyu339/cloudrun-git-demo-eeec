import { tool as createTool } from "ai";
import { z } from "zod";

/** Simulated weather lookup — swap for a real weather API in production. */
export const weatherTool = createTool({
  description: "Display the weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async function ({ location }) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const conditions = ["Sunny", "Partly cloudy", "Clear", "Breezy"] as const;
    const weather = conditions[location.length % conditions.length];
    const temperature = 18 + (location.length % 12);
    return { weather, temperature, location };
  },
});

/** Simulated stock quote — swap for a market data API in production. */
export const stockTool = createTool({
  description: "Get price for a stock",
  inputSchema: z.object({
    symbol: z.string().describe("The stock symbol to get the price for"),
  }),
  execute: async function ({ symbol }) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const normalized = symbol.trim().toUpperCase();
    const price = 80 + (normalized.charCodeAt(0) % 40) + (normalized.length % 7);
    return { symbol: normalized, price };
  },
});

export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
};
