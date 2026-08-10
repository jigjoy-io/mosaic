import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export class RuntimeService<TRuntimeState extends RuntimeState> {
	constructor(
		public readonly state: TRuntimeState,
		private readonly processor: EventProcessor,
	) {}

	join(participant: Participant): void {
		this.state.addParticipant(participant)
	}

	leave(participant: Participant): void {
		this.state.removeParticipant(participant)
	}

	private deliver(event: SemanticEvent): void {
		for (const participant of this.state.getParticipants()) {
			void this.react(participant, event)
		}
	}

	sendMessage(message: string, senderId: string): void {
		const participant = this.getParticipant(senderId)
		if (!participant) {
			throw new Error(`Participant ${senderId} not found`)
		}

		const userMessage: SemanticEvent = {
			type: "user.sent.message",
			producerId: senderId,
			occurredAt: new Date(),
			payload: {
				userId: senderId,
				message: message,
			},
		}

		this.deliver(userMessage)
	}

	getParticipant(id: string): Participant | undefined {
		if (!this.state.getParticipant(id)) {
			throw new Error(`Participant ${id} not found`)
		}

		return this.state.getParticipant(id)
	}

	private async react(consumer: Participant, event: SemanticEvent): Promise<void> {
		for await (const emittedEvent of this.processor.process(event, consumer, this.state)) {
			this.deliver(emittedEvent)
		}
	}
}
