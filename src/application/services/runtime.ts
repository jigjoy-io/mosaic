import { Participant } from "@domain/agentic-environment/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class RuntimeService {
	constructor(private readonly runtimeState: RuntimeState) {}

	join(participant: Participant): void {
		this.runtimeState.addParticipant(participant)
	}

	leave(participant: Participant): void {
		this.runtimeState.removeParticipant(participant)
	}

	deliver(event: SemanticEvent): void {
		for (const participant of this.runtimeState.getParticipants()) {
			void this.react(participant, event)
		}
	}

	private async react(participant: Participant, event: SemanticEvent): Promise<void> {
		for await (const emittedEvent of participant.process(event, this.runtimeState)) {
			this.deliver(emittedEvent)
		}
	}
}
