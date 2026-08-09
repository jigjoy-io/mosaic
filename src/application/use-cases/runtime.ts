import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"

export function defineRuntime<TRuntimeState extends RuntimeState>() {
	let runtime: RuntimeService<TRuntimeState> | null = null
	const processor = new EventProcessor()

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
