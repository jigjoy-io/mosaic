import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { Action } from "@domain/agentic-environment/participant/action"
import { SituationSpecification } from "@domain/agentic-environment/participant/situation-specification"
import { SituationContext } from "@domain/agentic-environment/participant/situation"

export type FunctionCallParams = {
	readonly call: FunctionCallItem
	readonly tool: Tool
	readonly signal?: AbortSignal
	readonly callerId: string
}

export type FunctionCallOutputParams = {
	readonly callId: string
	readonly output: string
}

export class FunctionCallRequested extends SituationSpecification {
	readonly conditionId = "function.call.requested"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.requested"
	}
}

export class FunctionCallCompleted extends SituationSpecification {
	readonly conditionId = "function.call.completed"
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext
		return event.type === "functions.call.completed"
	}
}

export class FunctionCall implements Action<FunctionCallParams> {
	readonly actionId: string = "function.call"

	async *run(input: FunctionCallParams): AsyncIterable<SemanticEvent> {
		const { call, tool, signal, callerId } = input
		if (signal?.aborted) {
			return
		}

		if (!tool) throw new Error(`Unknown tool: ${call.name}`)

		const result = await tool.invoke(JSON.parse(call.args))
		yield {
			type: "function.call.output",
			producerId: callerId,
			occurredAt: new Date(),
			payload: {
				functionId: call.callId,
				result: JSON.stringify(result),
			},
		}
	}
}
