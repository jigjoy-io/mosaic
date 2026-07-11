import type { Channel } from "../channel"
import type { Participant } from "../participant"
import { ParticipantManifest } from "../participant-manifest"

export interface SendMessageUseCase {
	execute(channel: Channel, message: string, caller: Participant<ParticipantManifest<unknown>>): Promise<void>
}
