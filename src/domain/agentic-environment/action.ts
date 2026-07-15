import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { WorkingMemory } from "./working-memory"

export abstract class Action {
	abstract execute(workingMemory: WorkingMemory): AsyncIterable<SemanticEvent>
}
