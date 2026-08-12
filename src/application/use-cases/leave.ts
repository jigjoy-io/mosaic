import { Participant } from "@domain/agentic-environment/participant/participant"
import { resolveRuntime } from "example/runtime"

export function leave(participant: Participant) {
	const runtime = resolveRuntime()
	runtime.leave(participant)
}
