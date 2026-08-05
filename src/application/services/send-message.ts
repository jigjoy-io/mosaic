import { Action } from "@domain/agentic-environment/participant/action"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export class SendMessage implements Action<{ answer: string; producerId: string }> {
	readonly actionId: string = "answer"

	async *run({ answer, producerId }: { answer: string; producerId: string }): AsyncIterable<SemanticEvent> {
		const messageText = `${producerId}: ${answer}`
		console.log(messageText)

		yield {
			type: "participant.send.message",
			producerId: producerId,
			occurredAt: new Date(),
			payload: {
				message: messageText,
			},
		}
	}
}
