import { describe, it, expect } from "@rstest/core"
import { DefaultInferenceRunner } from "@app/runners/inference-runner"
import { ModelRuntime } from "@domain/generative-model/runtime/model-runtime"
import { StreamingRuntime } from "@domain/generative-model/runtime/streaming-runtime"
import { InferenceRequest } from "@domain/generative-model/inference-request"
import { InferenceResponse } from "@domain/generative-model/inference-response"
import { ModelContext } from "@domain/model-context/model-context"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { makeModel } from "../helpers/fake-model"

async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = []
	for await (const item of stream) out.push(item)
	return out
}

const context = () => ModelContext.create("project-1")

describe("DefaultInferenceRunner", () => {
	it("yields the runtime's response items in order when not streaming", async () => {
		const items = [ModelMessageItem.rehydrate({ text: "a" }), ModelMessageItem.rehydrate({ text: "b" })]
		const runtime: ModelRuntime = {
			infer: async () => new InferenceResponse(items, undefined),
		}
		const runner = new DefaultInferenceRunner(runtime)

		const out = await collect(runner.run(context(), makeModel(false)))

		expect(out).toEqual(items)
	})

	it("delegates to stream() when the model streams and the runtime supports it", async () => {
		const streamed = ModelMessageItem.rehydrate({ text: "streamed" })
		let inferCalled = false
		const runtime: ModelRuntime & StreamingRuntime = {
			infer: async () => {
				inferCalled = true
				return new InferenceResponse([], undefined)
			},
			async *stream() {
				yield streamed
			},
		}
		const runner = new DefaultInferenceRunner(runtime)

		const out = await collect(runner.run(context(), makeModel(true)))

		expect(out).toEqual([streamed])
		expect(inferCalled).toBe(false)
	})

	it("falls back to infer() when the model streams but the runtime is not a StreamingRuntime", async () => {
		const item = ModelMessageItem.rehydrate({ text: "buffered" })
		const runtime: ModelRuntime = {
			infer: async () => new InferenceResponse([item], undefined),
		}
		const runner = new DefaultInferenceRunner(runtime)

		const out = await collect(runner.run(context(), makeModel(true)))

		expect(out).toEqual([item])
	})

	it("stops yielding when the abort signal is already aborted", async () => {
		const runtime: ModelRuntime = {
			infer: async () => new InferenceResponse([ModelMessageItem.rehydrate({ text: "x" })], undefined),
		}
		const runner = new DefaultInferenceRunner(runtime)

		const out = await collect(runner.run(context(), makeModel(false), AbortSignal.abort()))

		expect(out).toEqual([])
	})

	it("passes the model and context through to the runtime via an InferenceRequest", async () => {
		let seen: InferenceRequest | undefined
		const runtime: ModelRuntime = {
			infer: async (request) => {
				seen = request
				return new InferenceResponse([], undefined)
			},
		}
		const runner = new DefaultInferenceRunner(runtime)
		const ctx = context()
		const model = makeModel(false)

		await collect(runner.run(ctx, model))

		expect(seen?.context).toBe(ctx)
		expect(seen?.model).toBe(model)
	})
})
