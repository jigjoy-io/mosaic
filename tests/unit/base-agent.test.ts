import { describe, it, expect } from "@rstest/core"
import { BaseAgent } from "@app/participants/agent"
import { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import { InferenceRunner } from "@domain/agentic-environment/runners/inference-runner"
import { FunctionCallRunner } from "@domain/agentic-environment/runners/function-call-runner"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { ModelContext } from "@domain/model-context/model-context"
import { RecordingParticipant } from "../helpers/recording-participant"
import { makeModel } from "../helpers/fake-model"

const noInference: InferenceRunner = {
	async *run() {},
}
const noFunctionCalls: FunctionCallRunner = {
	async *run() {},
}

const aCall = () => FunctionCallItem.rehydrate({ callId: "c1", name: "fn", args: "{}" })

describe("BaseAgent.executeFunctionCall", () => {
	it("does nothing when the agent has not joined the environment", async () => {
		let ran = false
		const functionCalls: FunctionCallRunner = {
			async *run() {
				ran = true
			},
		}
		const env = new AgenticEnvironment()
		const agent = new BaseAgent(noInference, functionCalls)
		const other = new RecordingParticipant()
		other.join(env) // agent intentionally NOT joined

		await agent.executeFunctionCall(env, aCall())

		expect(ran).toBe(false)
		expect(other.find("onExternalFunctionCallOutput")).toEqual([])
	})

	it("delivers each runner output onto the bus as an external function-call output", async () => {
		const output = FunctionCallOutputItem.create("c1", "result")
		const functionCalls: FunctionCallRunner = {
			async *run() {
				yield output
			},
		}
		const env = new AgenticEnvironment()
		const agent = new BaseAgent(noInference, functionCalls)
		const other = new RecordingParticipant()
		agent.join(env)
		other.join(env)

		await agent.executeFunctionCall(env, aCall())

		expect(other.find("onExternalFunctionCallOutput")).toEqual([
			{ m: "onExternalFunctionCallOutput", args: [agent, output] },
		])
	})
})

describe("BaseAgent.runInference", () => {
	it("does nothing when the agent has not joined the environment", async () => {
		let ran = false
		const inference: InferenceRunner = {
			async *run() {
				ran = true
			},
		}
		const env = new AgenticEnvironment()
		const agent = new BaseAgent(inference, noFunctionCalls)
		new RecordingParticipant().join(env)

		await agent.runInference(env, ModelContext.create("p"), makeModel())

		expect(ran).toBe(false)
	})

	it("routes each inference item to the matching bus delivery by type", async () => {
		const reasoning = ReasoningItem.rehydrate({ content: undefined, encryptedContent: undefined, summary: [] })
		const call = FunctionCallItem.rehydrate({ callId: "c1", name: "fn", args: "{}" })
		const message = ModelMessageItem.rehydrate({ text: "hi" })
		const event = new SemanticEvent("custom", { ok: true })
		const inference: InferenceRunner = {
			async *run() {
				yield reasoning
				yield call
				yield message
				yield event
			},
		}
		const env = new AgenticEnvironment()
		const agent = new BaseAgent(inference, noFunctionCalls)
		const other = new RecordingParticipant()
		agent.join(env)
		other.join(env)

		await agent.runInference(env, ModelContext.create("p"), makeModel())

		expect(other.find("onExternalReasoning")).toEqual([{ m: "onExternalReasoning", args: [agent, reasoning] }])
		expect(other.find("onExternalFunctionCall")).toEqual([{ m: "onExternalFunctionCall", args: [agent, call] }])
		expect(other.find("onExternalModelMessage")).toEqual([{ m: "onExternalModelMessage", args: [agent, message] }])
		expect(other.find("onExternalEvent")).toEqual([{ m: "onExternalEvent", args: [agent, event] }])
	})
})
