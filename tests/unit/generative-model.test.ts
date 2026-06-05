import { describe, it, expect } from "@rstest/core"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { ModelSpecification } from "@domain/generative-model/generative-model"
import { Tool } from "@domain/generative-model/tool"
import { TokenUsage } from "@domain/generative-model/token-usage"
import { InputTokenDetails, OutputTokenDetails } from "@domain/generative-model/token-usage"
import { ModelContext } from "@domain/model-context/model-context"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
/** Minimal in-memory model satisfying the GenerativeModel port for wiring tests. */
function makeModel(): GenerativeModel {
	const specification: ModelSpecification = {
		name: "test-model",
		supportReasoningEffort: true,
		defaultReasoningEffort: "medium",
		supportStreaming: true,
		contextWindowSize: 1000,
		maxOutputTokens: 100,
		supportFunctionCalling: true,
	}
	let effort = "medium"
	let streaming = false
	let tools: Tool[] = []
	return {
		specification,
		setReasoningEffort: (e: string) => {
			effort = e
		},
		getReasoningEffort: () => effort,
		setStreaming: (s: boolean) => {
			streaming = s
		},
		getStreaming: () => streaming,
		setTools: (t: Tool[]) => {
			tools = t
		},
		getTools: () => tools,
	}
}

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

describe("InferenceRequest", () => {
	it("holds the model and context it was constructed with", () => {
		const model = makeModel()
		const context = ModelContext.create("project-1")

		const request = new InferenceRequest(model, context)

		expect(request.model).toBe(model)
		expect(request.context).toBe(context)
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
