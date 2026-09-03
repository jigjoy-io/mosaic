import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function createJoin<TRuntimeState extends RuntimeState>(resolveRuntime: () => RuntimeService<TRuntimeState>) {
	return function join(participant: Participant): void {
		resolveRuntime().join(participant)
	}
}
