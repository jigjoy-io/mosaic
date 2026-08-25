import { ModelContext } from "@domain/model-context/model-context"
import { LoopStateResult } from "./loop-state"

export type LoopStateId = "inference" | "inference_stream" | "function_call" | "model_message" | "message_received"

export interface LoopStateDefinition {
	id: LoopStateId
}

export class AgentLoopManaget {
	id: string
	stateId: LoopStateId
	agentId: string

	private constructor({
		id,
		stateId,
		agentId,
	}: {
		id: string
		stateId: LoopStateId
		agentId: string
		modelContext: ModelContext
	}) {
		this.id = id
		this.stateId = stateId
		this.agentId = agentId
	}

	resolveNextState(loopStateResult: LoopStateResult): LoopStateId {
		const currentStateId = loopStateResult.stateId
		switch (currentStateId) {
			case "message_received":
				return "inference"
			case "inference":
				return "model_message"
			case "function_call":
				return "inference"
			default:
				throw new Error("Invalid state")
		}
	}
}
