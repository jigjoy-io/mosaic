import { Condition, SemanticEvent } from "src"

export class InferenceCompleted extends Condition {
	isSatisfiedBy(event: SemanticEvent): boolean {
		return event.type === "inference.completed"
	}
}
