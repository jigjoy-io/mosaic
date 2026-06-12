import { describe, it, expect } from "@rstest/core"
import { TokenUsage } from "@domain/generative-model/token-usage"
import { InputTokenDetails, OutputTokenDetails } from "@domain/generative-model/token-usage"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"

describe("TokenUsage", () => {
	it("stores aggregate counts and the nested detail objects", () => {
		const usage = new TokenUsage(100, 40, 140, new InputTokenDetails(25), new OutputTokenDetails(10))

		expect(usage.inputTokens).toBe(100)
		expect(usage.outputTokens).toBe(40)
		expect(usage.totalTokens).toBe(140)
		expect(usage.inputTokenDetails.cached_tokens).toBe(25)
		expect(usage.outputTokenDetails.reasoning_tokens).toBe(10)
	})
})

describe("InferenceResponse", () => {
	it("holds the returned context items and token usage", () => {
		const items = [UserMessageItem.create("hi")]
		const usage = new TokenUsage(1, 1, 2, new InputTokenDetails(0), new OutputTokenDetails(0))

		const response = new InferenceResponse(items, usage)

		expect(response.contextItems).toBe(items)
		expect(response.tokenUsage).toBe(usage)
	})

	it("allows token usage to be absent", () => {
		const response = new InferenceResponse([], undefined)

		expect(response.contextItems).toEqual([])
		expect(response.tokenUsage).toBeUndefined()
	})
})
