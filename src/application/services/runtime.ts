import { Channel } from "@domain/agentic-environment/channel"
import { Participant } from "@domain/agentic-environment/participant"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class RuntimeService {
	constructor(private readonly channel: Channel) {}

	join(participant: Participant): void {
		this.channel.subscribe(participant)
	}

	leave(participant: Participant): void {
		this.channel.unsubscribe(participant)
	}

	deliver(event: SemanticEvent): void {
		for (const participant of this.channel.getParticipants()) {
			void this.react(participant, event)
		}
	}

	private async react(participant: Participant, event: SemanticEvent): Promise<void> {
		for await (const emittedEvent of participant.process(event)) {
			this.deliver(emittedEvent)
		}
	}
}
