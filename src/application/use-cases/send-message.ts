import { RuntimeService } from "@app/services/runtime"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export function createSendMessage<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function sendMessage(message: string, senderId: string): void {
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
}
