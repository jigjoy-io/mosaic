import { FunctionCallOutputParams, FunctionCallParams } from "@app/services/function-call"
import { InferenceResponse } from "./inference/response"
import { Interception } from "./participant/interception"
import type { InferenceParams } from "@domain/agentic-environment/inference/params"

export class AgentLoop {
	private interceptions: Interception<unknown>[] = []
	private status: "idle" | "running" | "paused" | "stopped" = "idle"
	private inferenceRequest: InferenceParams | null = null

	requestInterception(interception: Interception<unknown>) {
		this.interceptions.push(interception)
	}

	removeInterception(id: string) {
		this.interceptions = this.interceptions.filter((i) => i.id !== id)
	}

	handleInferenceRequest(request: InferenceParams) {
		this.inferenceRequest = request
	}

	handleInferenceResponse(response: InferenceResponse) {
		this.inferenceRequest?.context.applyModelOutput(response.contextItems)
	}

	handleFunctionCallRequest(call: FunctionCallParams) {}

	handleFunctionCallOutput(output: FunctionCallOutputParams) {}

	pauseLoop() {
		if (this.status !== "running") {
			throw new Error("Loop is not running")
		}
		this.status = "paused"
	}

	resumeLoop() {
		if (this.status !== "paused") {
			throw new Error("Loop is not paused")
		}
		this.status = "running"
	}

	stopLoop() {
		if (this.status !== "running" && this.status !== "paused") {
			throw new Error("Loop is not running")
		}
		this.status = "stopped"
	}
}
