import { Process, Rule, SituationContext } from "@domain/agentic-environment/participant/process"
import { Condition } from "@domain/agentic-environment/participant/condition"
import { resolveRuntime } from "example/runtime"
import { Answer } from "example/agent/state"
import { functionCall, inference, InferenceParams, ModelContext } from "src"
import { FunctionCallParams } from "@app/services/function-call"
import { Interception } from "@domain/agentic-environment/participant/interception"

export class MessageReceived extends Condition {
	readonly conditionId = "message.received"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "message.received"
	}
}

export class FreemiumAvailable extends Condition {
	readonly conditionId = "freemium.available"
	private readonly runtime = resolveRuntime()
	isSatisfiedBy(): boolean {
		const { freemiumAccount } = this.runtime.state

		return freemiumAccount.getNumberOfTry() < freemiumAccount.getMaxNumberOfTry()
	}
}

export class FunctionCallRequested extends Condition {
	readonly conditionId = "function.call.requested"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.requested"
	}
}

export class FunctionCallCompleted extends Condition {
	readonly conditionId = "function.call.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.completed"
	}
}

const messageReceived: Rule<InferenceParams> = {
	condition: new MessageReceived().and(new FreemiumAvailable()),
	resolve: (context: SituationContext) => {
		const { participant } = context
		return {
			model: "gpt-5.4",
			streaming: false,
			callerId: "user-123",
			signal: new AbortSignal(),
			context: participant.memory.getContext(),
		}
	},
	action: inference,
}

const functionCallRequested: Rule<FunctionCallParams> = {
	condition: new FunctionCallRequested(),

	resolve: ({ event }: SituationContext) => {
		const { call, tool } = event.payload as FunctionCallParams
		return {
			call,
			tool,
			signal: new AbortSignal(),
			callerId: "user-123",
		}
	},
	action: functionCall,
}

const functionCallCompleted: Rule<InferenceParams> = {
	condition: new FunctionCallCompleted(),
	resolve: (context: SituationContext) => {
		const { participant } = context
		return {
			model: "gpt-5.4",
			streaming: false,
			callerId: "user-123",
			signal: new AbortSignal(),
			context: participant.memory.getContext(),
		}
	},
	action: inference,
}

export class InferenceCompleted extends Condition {
	readonly conditionId = "inference.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "inference.completed"
	}
}

const answer = new Answer()

const inferenceCompleted: Rule<{ message: string; producerId: string }> = {
	condition: new InferenceCompleted(),
	resolve: (context: SituationContext) => {
		return {
			message: "Hello, world!",
			producerId: "user-123",
		}
	},
	action: answer,
}

const autonomousLoop = Process.create({
	processName: "autonomous-loop",
	actions: [inference, functionCall, answer],
	rules: [messageReceived, functionCallRequested, functionCallCompleted, inferenceCompleted],
})
