import { describe, it, expect } from "@rstest/core"
import { StreamingInference, NonStreamingInference } from "@app/services/inference-runner"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"
import type { ModelName } from "@domain/generative-model/generative-model"
import type { Endpoint } from "@domain/generative-model/endpoint"
import { ModelContext } from "@domain/model-context/model-context"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { BaseParticipant } from "@app/participants/participant"

async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = []
	for await (const item of stream) out.push(item)
	return out
}

function makeParams(overrides: Partial<InferenceParams<ModelName>> = {}): InferenceParams<ModelName> {
	return {
		model: "gpt-5.4",
		context: ModelContext.create("test"),
		caller: new BaseParticipant(),
		environment: new AgenticEnvironment(),
		...overrides,
	}
}

describe("NonStreamingInference", () => {
	it("yields the endpoint's response items in order", async () => {
		const items = [ModelMessageItem.rehydrate({ text: "a" }), ModelMessageItem.rehydrate({ text: "b" })]
		const endpoint: Endpoint = {
			endpointMapper: {} as any,
			infer: async () => new InferenceResponse(items, undefined),
			async *stream() {},
		}
		const runner = new NonStreamingInference()

		const out = await collect(runner.run(makeParams(), endpoint))

		expect(out).toEqual(items)
	})

	it("stops yielding when the abort signal is already aborted", async () => {
		const endpoint: Endpoint = {
			endpointMapper: {} as any,
			infer: async () => new InferenceResponse([ModelMessageItem.rehydrate({ text: "x" })], undefined),
			async *stream() {},
		}
		const runner = new NonStreamingInference()

		const out = await collect(runner.run(makeParams({ signal: AbortSignal.abort() }), endpoint))

		expect(out).toEqual([])
	})

	it("passes the inference params through to the endpoint", async () => {
		let seen: InferenceParams<ModelName> | undefined
		const endpoint: Endpoint = {
			endpointMapper: {} as any,
			infer: async (params) => {
				seen = params
				return new InferenceResponse([], undefined)
			},
			async *stream() {},
		}
		const runner = new NonStreamingInference()
		const params = makeParams()

		await collect(runner.run(params, endpoint))

		expect(seen).toBe(params)
	})
})

describe("StreamingInference", () => {
	it("yields events from the endpoint's stream", async () => {
		const event = new SemanticEvent("chunk", { text: "hi" })
		const endpoint: Endpoint = {
			endpointMapper: {} as any,
			infer: async () => new InferenceResponse([], undefined),
			async *stream() {
				yield event
			},
		}
		const runner = new StreamingInference()

		const out = await collect(runner.run(makeParams(), endpoint))

		expect(out).toEqual([event])
	})

	it("stops yielding when the abort signal is already aborted", async () => {
		const endpoint: Endpoint = {
			endpointMapper: {} as any,
			infer: async () => new InferenceResponse([], undefined),
			async *stream() {
				yield new SemanticEvent("chunk", {})
			},
		}
		const runner = new StreamingInference()

		const out = await collect(runner.run(makeParams({ signal: AbortSignal.abort() }), endpoint))

		expect(out).toEqual([])
	})
})
