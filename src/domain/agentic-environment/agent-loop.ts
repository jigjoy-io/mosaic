import { InferenceResponse } from "./inference/response"
import { ModelContext } from "@domain/model-context/model-context"
import { SemanticEvent } from "./semantic-event/event"

export type LoopStateId = "inference" | "function_call" | "model_message" | "idle"

export interface LoopStateDefinition {
	id: LoopStateId
}

export class AgentLoop {
	id: string
	stateId: LoopStateId
	modelContext: ModelContext

	private constructor({
		id,
		stateId,
		modelContext,
	}: {
		id: string
		stateId: LoopStateId
		modelContext: ModelContext
	}) {
		this.id = id
		this.stateId = stateId
		this.modelContext = modelContext
	}

	handleMessage(message: string) {
		this.modelContext.addUserMessage(message)
		this.stateId = "idle"
	}

	start() {
		this.stateId = "inference"
	}

	handleStreamChunk(event: SemanticEvent) {
		//this.modelContext.applyModelOutput(event.contextItems)
		this.stateId = "idle"
	}

	handleInferenceResponse(response: InferenceResponse) {
		this.modelContext.applyModelOutput(response.contextItems)
		if (response.contextItems.some((item) => item.getType() === "function_call")) {
			this.stateId = "function_call"
		} else if (response.contextItems.some((item) => item.getType() === "model_message")) {
			this.stateId = "model_message"
		} else {
			throw new Error("Invalid response")
		}
		return this.stateId
	}

	handleFunctionCallOutput(output: string) {
		this.modelContext.addFunctionCallOutput(output)
		this.stateId = "inference"
	}

	static rehydrate(id: string, stateId: LoopStateId, modelContext: ModelContext): AgentLoop {
		return new AgentLoop({ id, stateId, modelContext })
	}

	static create(message: string, modelContext: ModelContext): AgentLoop {
		modelContext.addUserMessage(message)
		return new AgentLoop({ id: crypto.randomUUID(), stateId: "idle", modelContext })
	}
}
