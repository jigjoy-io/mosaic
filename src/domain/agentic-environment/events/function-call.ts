import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class FunctionCallExecuted extends SemanticEvent {
	readonly type = "function_call_output"

	constructor(
		producerId: string,
		occurredAt: Date,
		readonly output: FunctionCallOutputItem,
	) {
		super(producerId, occurredAt)
	}

	static create({
		producerId,
		output,
	}: {
		producerId: string
		output: FunctionCallOutputItem
	}): FunctionCallExecuted {
		return new FunctionCallExecuted(producerId, new Date(), output)
	}
}
