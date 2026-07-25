import { Participant } from "@domain/agentic-environment/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class RuntimeService<TRuntimeState extends RuntimeState> {
	constructor(public readonly state: TRuntimeState) {}

	join(participant: Participant): void {
		this.state.addParticipant(participant)
	}

	leave(participant: Participant): void {
		this.state.removeParticipant(participant)
	}

	deliver(event: SemanticEvent): void {
		for (const participant of this.state.getParticipants()) {
			void this.react(participant, event)
		}
	}

	getParticipant(id: string): Participant | undefined {
		if (!this.state.getParticipant(id)) {
			throw new Error(`Participant ${id} not found`)
		}

		return this.state.getParticipant(id)
	}

	private async react(participant: Participant, event: SemanticEvent): Promise<void> {
		for await (const emittedEvent of participant.process(event)) {
			this.deliver(emittedEvent)
		}
	}
}
