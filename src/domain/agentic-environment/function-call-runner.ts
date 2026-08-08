import type { FunctionCallParams } from "@app/services/function-call"
import { SemanticEvent } from "./semantic-event/event"

export interface FunctionCallRunner {
	run(input: FunctionCallParams): AsyncIterable<SemanticEvent>
}
