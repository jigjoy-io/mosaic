import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@domain/agentic-environment/agent-loop"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function createStartLoop<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function startLoop(inferenceRequest: InferenceRequest) {
		const runtime = resolveRuntime()
		const agentLoop = new AgentLoop()

		const loopStateId = agentLoop.start()

		while (loopStateId !== "model_message") {
			switch (loopStateId) {
				case "inference":
					// TODO: SEND INFERENCE REQUEST
					break
				case "function_call":
					// TODO: HANDLE FUNCTION CALL
					break
			}
		}
	}
}
