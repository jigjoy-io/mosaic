import { RuntimeService } from "@app/services/runtime"
import { InferenceRequest } from "@domain/agentic-environment/inference/request"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function createStartLoop<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function startLoop(inferenceRequest: InferenceRequest) {
		const runtime = resolveRuntime()
		const inferenceRunner = runtime.getInferenceRunner()
		const functionCallRunner = runtime.getFunctionCallRunner()
	}
}
