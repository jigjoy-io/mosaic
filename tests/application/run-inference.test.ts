import { describe, it, expect } from "@rstest/core"
import { RunInference } from "@app/use-cases/run-inference"
import { AgenticEnvironment } from "@domain/agentic-environment/channel"
import { BaseParticipant } from "@app/participants/participant"
import { ModelContext } from "@domain/model-context/model-context"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { InferenceResponse } from "@domain/agentic-environment/inference/response"
import { RecordingParticipant } from "../helpers/recording-participant"
import type { ModelSpecification } from "@domain/generative-model/generative-model"
import type { GenerativeModelRepository } from "@domain/generative-model/generative-model-repository"
import type { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import type { Endpoint } from "@domain/generative-model/endpoint"
import { gpt54Specification } from "@infra/providers/openai/models/gpt-5-4"

function makeEndpoint(items: any[] = []): Endpoint {
	return {
		endpointMapper: {} as any,
		infer: async () => new InferenceResponse(items, undefined),
		async *stream() {
			for (const item of items) yield item
		},
	}
}

function makeRepository(
	endpoint: Endpoint,
	specification: ModelSpecification = gpt54Specification,
): GenerativeModelRepository {
	return {
		getByModelName: async () => ({ endpoint, specification }),
	}
}

const noOpValidator: InferenceRequestValidator = {
	validate: () => {},
} as any

describe("RunInference", () => {
	it("delivers model messages to the environment", async () => {
		const message = ModelMessageItem.rehydrate({ text: "hello" })
		const endpoint = makeEndpoint([message])
		const useCase = new RunInference(makeRepository(endpoint), noOpValidator)

		const env = AgenticEnvironment.create({ name: "test", silent: false })
		const caller = new BaseParticipant()
		const observer = new RecordingParticipant()
		caller.join(env)
		observer.join(env)

		const context = ModelContext.create("p")
		context.addContextItem(UserMessageItem.create("hi"))

		await useCase.execute({
			model: "gpt-5.4",
			context,
			caller,
			environment: env,
		})

		expect(observer.find("onExternalModelMessage")).toEqual([
			{ m: "onExternalModelMessage", args: [caller, message] },
		])
	})

	it("delivers function calls to the environment", async () => {
		const call = FunctionCallItem.rehydrate({ callId: "c1", name: "fn", args: "{}" })
		const endpoint = makeEndpoint([call])
		const useCase = new RunInference(makeRepository(endpoint), noOpValidator)

		const env = AgenticEnvironment.create({ name: "test" })
		const caller = new BaseParticipant()
		const observer = new RecordingParticipant()
		caller.join(env)
		observer.join(env)

		await useCase.execute({
			model: "gpt-5.4",
			context: ModelContext.create("p"),
			caller,
			environment: env,
		})

		expect(observer.find("onExternalFunctionCall")).toEqual([{ m: "onExternalFunctionCall", args: [caller, call] }])
	})

	it("delivers reasoning items to the environment", async () => {
		const reasoning = ReasoningItem.rehydrate({ content: undefined, encryptedContent: undefined, summary: [] })
		const endpoint = makeEndpoint([reasoning])
		const useCase = new RunInference(makeRepository(endpoint), noOpValidator)

		const env = AgenticEnvironment.create({ name: "test" })
		const caller = new BaseParticipant()
		const observer = new RecordingParticipant()
		caller.join(env)
		observer.join(env)

		await useCase.execute({
			model: "gpt-5.4",
			context: ModelContext.create("p"),
			caller,
			environment: env,
		})

		expect(observer.find("onExternalReasoning")).toEqual([{ m: "onExternalReasoning", args: [caller, reasoning] }])
	})

	it("stops when the abort signal is triggered", async () => {
		const message = ModelMessageItem.rehydrate({ text: "should not arrive" })
		const endpoint = makeEndpoint([message])
		const useCase = new RunInference(makeRepository(endpoint), noOpValidator)

		const env = AgenticEnvironment.create({ name: "test" })
		const caller = new BaseParticipant()
		const observer = new RecordingParticipant()
		caller.join(env)
		observer.join(env)

		await useCase.execute({
			model: "gpt-5.4",
			context: ModelContext.create("p"),
			caller,
			environment: env,
			signal: AbortSignal.abort(),
		})

		expect(observer.find("onExternalModelMessage")).toEqual([])
	})
})
