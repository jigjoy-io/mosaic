import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { resolveRuntime } from "example/runtime"

export function sendMessage(message: string, senderId: string) {
	const runtime = resolveRuntime()

	const participant = runtime.getParticipant(senderId)
	if (!participant) {
		throw new Error(`Participant ${senderId} not found`)
	}

	const userMessage: SemanticEvent = {
		type: "message.sent",
		producerId: senderId,
		occurredAt: new Date(),
		payload: {
			userId: senderId,
			message: message,
		},
	}

	runtime.deliver(userMessage)
}
