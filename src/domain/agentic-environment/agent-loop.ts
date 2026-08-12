import { InferenceResponse } from "./inference/response"
import { ModelContext } from "@domain/model-context/model-context"

export type LoopStateId = "inference" | "function_call" | "model_message"

export interface LoopStateDefinition {
	id: LoopStateId
}

export class AgentLoop {
	start(): LoopStateId {
		return "inference"
	}

	handleInferenceResponse(response: InferenceResponse, modelContext: ModelContext) {
		modelContext.applyModelOutput(response.contextItems)
		if (response.contextItems.some((item) => item.getType() === "function_call")) {
			return "function_call"
		} else if (response.contextItems.some((item) => item.getType() === "model_message")) {
			return "model_message"
		} else {
			throw new Error("Invalid response")
		}
	}

	handleFunctionCallOutput(output: string, modelContext: ModelContext) {
		modelContext.addFunctionCallOutput(output)
		return "inference"
	}
}
