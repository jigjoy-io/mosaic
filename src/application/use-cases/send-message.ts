import type { Channel } from "@domain/agentic-environment/channel"
import type { Participant } from "@domain/agentic-environment/participant"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class SendMessage {
	async execute(channel: Channel, message: string, caller: Participant): Promise<void> {
		const manifest = caller.getManifest()
		channel.deliver(SemanticEvent.create({ type: "message", producerId: manifest.getId(), data: message }))
	}
}
