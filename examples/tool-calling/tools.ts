import type { FunctionTool } from "@domain/generative-model/tool"

const QUOTES: Record<string, { price: number; currency: string; changePercent: number }> = {
	AAPL: { price: 227.52, currency: "USD", changePercent: 1.14 },
	MSFT: { price: 418.1, currency: "USD", changePercent: -0.32 },
	NVDA: { price: 131.28, currency: "USD", changePercent: 2.07 },
}

export const getStockQuote: FunctionTool = {
	type: "function",
	name: "get_stock_quote",
	description: "Look up the latest quote for a publicly traded stock by ticker symbol.",
	strict: false,
	parameters: {
		type: "object",
		properties: {
			ticker: {
				type: "string",
				description: "The stock ticker symbol, for example AAPL or MSFT.",
			},
		},
		required: ["ticker"],
		additionalProperties: false,
	},
	invoke: async ({ ticker }: { ticker: string }) => {
		const quote = QUOTES[ticker.toUpperCase()]

		if (!quote) {
			return { error: `No quote found for ticker "${ticker}".` }
		}

		return {
			ticker: ticker.toUpperCase(),
			...quote,
			asOf: new Date().toISOString(),
		}
	},
}
