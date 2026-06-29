import type { Channel } from "../channel"
import type { Participant } from "../participant"

export interface SendMessageUseCase {
	execute(channel: Channel, message: string, caller: Participant): Promise<void>
}
