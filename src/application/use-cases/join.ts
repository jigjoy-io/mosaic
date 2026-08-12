import { Participant } from "@domain/agentic-environment/participant/participant"
import { resolveRuntime } from "example/runtime"

export function join(participant: Participant) {
	const runtime = resolveRuntime()
	runtime.join(participant)
}
