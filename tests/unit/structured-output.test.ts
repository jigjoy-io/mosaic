import { describe, it, expect } from "@rstest/core"
import { Gpt54 } from "@infra/providers/openai/models/gpt-5-4"
import { ClaudeOpus47 } from "@infra/providers/anthropic/models/claude-4-7-opus"
import { Gemini31Pro } from "@infra/providers/gemini/models/gemini-3-1-pro"
import { DeepSeekV4Flash } from "@infra/providers/deepseek/models/deepseek-v4-flash"

const testSchema = {
	type: "object",
	properties: {
		city: { type: "string" },
		temperature: { type: "number" },
	},
	required: ["city", "temperature"],
	additionalProperties: false,
}

describe("StructuredOutput on model classes", () => {
	it("defaults to no structured output", () => {
		const model = new Gpt54()

		expect(model.hasStructuredOutput()).toBe(false)
		expect(model.getStructuredOutput()).toBeUndefined()
	})

	it("sets and gets structured output format", () => {
		const model = new Gpt54()
		const format = { name: "weather", schema: testSchema, strict: true }

		model.setStructuredOutput(format)

		expect(model.hasStructuredOutput()).toBe(true)
		expect(model.getStructuredOutput()).toEqual(format)
	})

	it("clears structured output when set to undefined", () => {
		const model = new Gpt54()

		model.setStructuredOutput({ name: "weather", schema: testSchema })
		model.setStructuredOutput(undefined)

		expect(model.hasStructuredOutput()).toBe(false)
		expect(model.getStructuredOutput()).toBeUndefined()
	})

	it("reports supportStructuredOutput true for OpenAI models", () => {
		expect(new Gpt54().specification.supportStructuredOutput).toBe(true)
	})

	it("reports supportStructuredOutput true for Anthropic models", () => {
		expect(new ClaudeOpus47().specification.supportStructuredOutput).toBe(true)
	})

	it("reports supportStructuredOutput true for Gemini models", () => {
		expect(new Gemini31Pro().specification.supportStructuredOutput).toBe(true)
	})

	it("reports supportStructuredOutput false for DeepSeek models", () => {
		expect(new DeepSeekV4Flash().specification.supportStructuredOutput).toBe(false)
	})
})
