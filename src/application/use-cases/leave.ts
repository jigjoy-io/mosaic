import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function createLeave<TRuntimeState extends RuntimeState>(resolveRuntime: () => RuntimeService<TRuntimeState>) {
	return function leave(participant: Participant): void {
		resolveRuntime().leave(participant)
	}
}
