import { InferenceRunner } from "@app/services/inference-runner"
import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@domain/agentic-environment/agent-loop"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

async function handleLoop(agentLoop: AgentLoop, inferenceRequest: InferenceRequest, inferenceRunner: InferenceRunner) {
	let loopStateId = agentLoop.stateId
	while (loopStateId !== "model_message") {
		switch (loopStateId) {
			case "inference":
				if (inferenceRequest.streaming) {
					const stream = await inferenceRunner.streamInference(inferenceRequest)
					for await (const event of stream) {
						//loopStateId = agentLoop.handleStreamChunk(event)
					}
				} else {
					const response = await inferenceRunner.runInference(inferenceRequest)
					loopStateId = agentLoop.handleInferenceResponse(response)
				}
				break
			case "function_call":
				// TODO: HANDLE FUNCTION CALL
				break
		}
	}
}

export function createStartLoop<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function startLoop(agentLoop: AgentLoop, inferenceRequest: InferenceRequest) {
		const runtime = resolveRuntime()
		const inferenceRunner = runtime.getInferenceRunner()
		handleLoop(agentLoop, inferenceRequest, inferenceRunner)
	}
}
