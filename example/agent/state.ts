import { Action } from "@domain/agentic-environment/participant/process"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export class Answer implements Action<{ message: string; producerId: string }> {
	readonly actionId: string = "answer"

	async *run({ message, producerId }: { message: string; producerId: string }): AsyncIterable<SemanticEvent> {
		const messageText = `${producerId}: ${message}`
		console.log(messageText)
	}
}
