import { Action, SemanticEvent } from "src"

export class AnswerAction implements Action<{ message: string }> {
	id: string = "answer"

	async *run({ message, producerId }: { message: string; producerId: string }): AsyncIterable<SemanticEvent> {
		const messageText = `${producerId}: ${message}`
		console.log(messageText)
	}
}
