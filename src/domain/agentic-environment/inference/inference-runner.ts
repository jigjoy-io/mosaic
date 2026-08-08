import { SemanticEvent } from "../semantic-event/event"
import type { InferenceRequest } from "./request"

export interface InferenceRunner {
	run(input: InferenceRequest): AsyncIterable<SemanticEvent>
}
