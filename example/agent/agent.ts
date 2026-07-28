import { FreemiumAvailable, FunctionCallRequested, UserSentMessage } from "./conditions"
import { createAgent, createRule, functionCall, inference, InferenceResponse } from "src"
import { AnswerAction } from "example/user/action"
import { InferenceCompleted } from "example/user/condition"
import { Process } from "@domain/agentic-environment/participant/process/process"
import { FunctionCallParams } from "@app/services/function-call"

const userAnswer = new AnswerAction()

const freemiumRule = createRule({
	condition: new UserSentMessage().and(new FreemiumAvailable()),
	resolveInput: ({ participant }) => {
		return {
			model: "gpt-5.4" as const,
			streaming: false,
			context: participant.memory.getContext(),
			callerId: participant.id,
		}
	},
	action: inference,
})

const functionCallRule = createRule({
	condition: new FunctionCallRequested(),
	resolveInput: ({ event }) => {
		const payload = event.payload as FunctionCallParams
		return {
			type: event.type,
			call: payload.call,
			tool: payload.tool,
			signal: payload.signal,
		}
	},
	action: functionCall,
})

const answerRule = createRule({
	condition: new InferenceCompleted(),
	resolveInput: ({ event }) => {
		const payload = event.payload as InferenceResponse
		return {
			type: event.type,
			message: payload.contextItems[0].toString(),
			producerId: event.producerId,
		}
	},
	action: userAnswer,
})

const freemiumProcess: Process = {
	processId: "freemium",
	rules: [freemiumRule, functionCallRule, answerRule],
}

const agent = createAgent({
	manifest: {
		name: "Agent",
		instruction: "You are a helpful assistant.",
		tools: [],
	},
})

export { agent }
