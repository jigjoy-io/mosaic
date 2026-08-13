import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { InferenceRunner } from "./inference-runner"

export class RuntimeService<TRuntimeState extends RuntimeState> {
	constructor(
		public readonly state: TRuntimeState,
		private readonly processor: EventProcessor,
		private readonly inferenceRunner: InferenceRunner,
	) {}

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

	getInferenceRunner(): InferenceRunner {
		return this.inferenceRunner
	}

	private async react(consumer: Participant, event: SemanticEvent): Promise<void> {
		for await (const emittedEvent of this.processor.process(event, consumer, this.state)) {
			this.deliver(emittedEvent)
		}
	}
}
