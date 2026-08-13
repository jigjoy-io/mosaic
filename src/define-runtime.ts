import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import { createJoin } from "./application/use-cases/join"
import { createLeave } from "./application/use-cases/leave"
import { createSendMessage } from "./application/use-cases/send-message"
import { createStartLoop } from "@app/use-cases/start-loop"
import { InferenceRunner } from "@app/services/inference-runner"
import { supportedModels } from "@app/services/models"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"

export type InferenceRunnerConfig = {
	supportedModels: GenerativeModel[]
	runner: InferenceRunner
}

export function defineRuntime<TRuntimeState extends RuntimeState>() {
	let runtime: RuntimeService<TRuntimeState> | null = null
	const processor = new EventProcessor()

	function initializeRuntime(config: {
		state: TRuntimeState
		inferenceRunnerConfig?: InferenceRunnerConfig
	}): RuntimeService<TRuntimeState> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		const inferenceRunner =
			config.inferenceRunnerConfig?.runner ??
			new InferenceRunner(
				config.inferenceRunnerConfig?.supportedModels ?? supportedModels,
				new InferenceRequestValidator(),
			)

		runtime = new RuntimeService(config.state, processor, inferenceRunner)

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

	const join = createJoin(resolveRuntime)
	const leave = createLeave(resolveRuntime)
	const sendMessage = createSendMessage(resolveRuntime)
	const startLoop = createStartLoop(resolveRuntime)

	return {
		initializeRuntime,
		resolveRuntime,
		resolveParticipant,
		join,
		leave,
		sendMessage,
		startLoop,
	}
}
