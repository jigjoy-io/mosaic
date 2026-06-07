import { describe, it, expect } from "@rstest/core"
import { InferenceParams } from "@domain/agentic-environment/inference/params"
import { ModelName, ModelSpecification } from "@domain/generative-model/generative-model"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { RequestValidationRule } from "@domain/generative-model/request-validation/rule"
import { ReasoningEffortValidation } from "@domain/generative-model/request-validation/reasoning-effort"
import { ToolCallingValidation } from "@domain/generative-model/request-validation/tool-calling"
import { StreamingValidation } from "@domain/generative-model/request-validation/streaming"
import { StructuredOutputValidation } from "@domain/generative-model/request-validation/structured-output"
import { ContextValidation } from "@domain/generative-model/request-validation/context"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { gpt54Specification } from "@infra/providers/openai/models/gpt-5-4"

function makeParams(overrides: Partial<InferenceParams<ModelName>> = {}): InferenceParams<ModelName> {
	const context = ModelContext.create("test")
	context.addContextItem(
		ReasoningItem.rehydrate({
			content: InputText.rehydrate({ text: "thinking" }),
			encryptedContent: undefined,
			summary: [],
		}),
	)

	return {
		model: "gpt-5-4",
		context,
		caller: {} as InferenceParams<ModelName>["caller"],
		environment: {} as InferenceParams<ModelName>["environment"],
		...overrides,
	}
}

function makeSpecification(overrides: Partial<ModelSpecification> = {}): ModelSpecification {
	return {
		...gpt54Specification,
		...overrides,
	}
}

describe("InferenceRequestValidator", () => {
	it("passes when all injected rules are valid", () => {
		const validator = new InferenceRequestValidator([{ name: "test", isValid: () => true }])

		expect(() => validator.validate(makeParams(), makeSpecification())).not.toThrow()
	})

	it("throws when an injected rule fails", () => {
		const validator = new InferenceRequestValidator([{ name: "streaming", isValid: () => false }])

		expect(() => validator.validate(makeParams(), makeSpecification())).toThrow(
			'Request validation "streaming" failed for model "gpt-5.4"',
		)
	})

	it("stops at the first failing rule", () => {
		const calls: string[] = []
		const rules: RequestValidationRule[] = [
			{
				name: "first",
				isValid: () => {
					calls.push("first")
					return false
				},
			},
			{
				name: "second",
				isValid: () => {
					calls.push("second")
					return false
				},
			},
		]
		const validator = new InferenceRequestValidator(rules)

		expect(() => validator.validate(makeParams(), makeSpecification())).toThrow(
			'Request validation "first" failed for model "gpt-5.4"',
		)
		expect(calls).toEqual(["first"])
	})

	it("validates a default request against the default rules", () => {
		const validator = new InferenceRequestValidator()

		expect(() => validator.validate(makeParams(), makeSpecification())).not.toThrow()
	})
})

describe("ReasoningEffortValidation", () => {
	const rule = new ReasoningEffortValidation()

	it("passes when reasoning effort is not requested", () => {
		expect(rule.isValid(makeParams(), makeSpecification({ supportsReasoningEffort: false }))).toBe(true)
	})

	it("fails when reasoning effort is requested but unsupported", () => {
		expect(
			rule.isValid(makeParams({ reasoningEffort: "high" }), makeSpecification({ supportsReasoningEffort: false })),
		).toBe(false)
	})

	it("fails when reasoning effort is not in the supported list", () => {
		expect(rule.isValid(makeParams({ reasoningEffort: "invalid" }), makeSpecification())).toBe(false)
	})

	it("passes when reasoning effort is supported", () => {
		expect(rule.isValid(makeParams({ reasoningEffort: "high" }), makeSpecification())).toBe(true)
	})
})

describe("ToolCallingValidation", () => {
	const rule = new ToolCallingValidation()

	it("passes when tools are not passed", () => {
		expect(rule.isValid(makeParams(), makeSpecification({ supportsFunctionCalling: false }))).toBe(true)
	})

	it("fails when tools are passed, even empty, and function calling is unsupported", () => {
		expect(rule.isValid(makeParams({ tools: [] }), makeSpecification({ supportsFunctionCalling: false }))).toBe(false)
	})
})

describe("StreamingValidation", () => {
	const rule = new StreamingValidation()

	it("passes when streaming is not requested", () => {
		expect(rule.isValid(makeParams(), makeSpecification({ supportsStreaming: false }))).toBe(true)
	})

	it("fails when streaming is requested but unsupported", () => {
		expect(rule.isValid(makeParams({ streaming: true }), makeSpecification({ supportsStreaming: false }))).toBe(
			false,
		)
	})
})

describe("StructuredOutputValidation", () => {
	const rule = new StructuredOutputValidation()

	it("passes when structured output is not requested", () => {
		expect(rule.isValid(makeParams(), makeSpecification({ supportsStructuredOutput: false }))).toBe(true)
	})

	it("fails when structured output is requested but unsupported", () => {
		expect(
			rule.isValid(
				makeParams({ structuredOutput: { schema: { type: "object" } } }),
				makeSpecification({ supportsStructuredOutput: false }),
			),
		).toBe(false)
	})
})

describe("ContextValidation", () => {
	const rule = new ContextValidation()

	it("passes when all context item types are supported", () => {
		expect(rule.isValid(makeParams(), makeSpecification())).toBe(true)
	})

	it("passes when context includes supported message items", () => {
		const context = ModelContext.create("test")
		context.addContextItem(UserMessageItem.create("hello"))

		expect(rule.isValid(makeParams({ context }), makeSpecification())).toBe(true)
	})

	it("fails when a context item type is unsupported", () => {
		const context = ModelContext.create("test")
		context.addContextItem({
			getType: () => "unsupported_type",
		} as never)

		expect(rule.isValid(makeParams({ context }), makeSpecification())).toBe(false)
	})

	it("fails when a message role is unsupported by the model", () => {
		const context = ModelContext.create("test")
		context.addContextItem(UserMessageItem.create("hello"))

		expect(
			rule.isValid(
				makeParams({ context }),
				makeSpecification({
					supportedContextItemTypes: ["reasoning", "function_call", "function_call_output"],
				}),
			),
		).toBe(false)
	})
})
