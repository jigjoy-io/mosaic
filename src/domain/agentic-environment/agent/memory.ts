import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Action } from "../behavior/action"

export class WorkingMemory {}

export interface BoundAction {
	execute(event: SemanticEvent, memory: WorkingMemory): AsyncIterable<SemanticEvent>
}

export class ActionBinding<TParams> implements BoundAction {
	constructor(
		private readonly action: Action<TParams>,
		private readonly resolveParams: (event: SemanticEvent, memory: WorkingMemory) => TParams,
	) {}

	execute(event: SemanticEvent, memory: WorkingMemory): AsyncIterable<SemanticEvent> {
		return this.action.execute(this.resolveParams(event, memory))
	}
}
