import { InferenceRunner } from "@app/services/inference-runner"
import { supportedModels } from "@app/services/models"
import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import {
	defaultRequestValidationRules,
	InferenceRequestValidator,
} from "@domain/generative-model/request-validation/inference-request-validator"

export function defineRuntime<TRuntimeState extends RuntimeState>() {
	let runtime: RuntimeService<TRuntimeState> | null = null
	const processor = new EventProcessor()
	const inferenceRunner = new InferenceRunner(
		supportedModels,
		new InferenceRequestValidator(defaultRequestValidationRules),
	)

	function initializeRuntime(config: { state: TRuntimeState }): RuntimeService<TRuntimeState> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		runtime = new RuntimeService(config.state, processor)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TRuntimeState> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	function resolveParticipant(id: string): Participant {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		const participant = runtime.state.getParticipant(id)

		if (!participant) {
			throw new Error(`Participant ${id} not found`)
		}

		return participant
	}

	return {
		initializeRuntime,
		resolveRuntime,
		resolveParticipant,
	}
}
