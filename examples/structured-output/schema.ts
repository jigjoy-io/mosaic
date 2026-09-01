import type { StructuredOutputFormat } from "src"

export const investmentBrief: StructuredOutputFormat = {
	name: "investment_brief",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		properties: {
			company: {
				type: "string",
				description: "The company name.",
			},
			ticker: {
				type: "string",
				description: "The stock ticker symbol, for example AAPL.",
			},
			thesis: {
				type: "string",
				description: "A one-paragraph investment thesis.",
			},
			riskLevel: {
				type: "string",
				enum: ["low", "medium", "high"],
				description: "Overall risk of the position.",
			},
			recommendation: {
				type: "string",
				enum: ["buy", "hold", "sell"],
				description: "Recommended action.",
			},
			keyRisks: {
				type: "array",
				items: { type: "string" },
				description: "The main risks to the thesis.",
			},
		},
		required: ["company", "ticker", "thesis", "riskLevel", "recommendation", "keyRisks"],
	},
}
