import type { AgenticEnvironment } from "../agentic-environment"
import type { Participant } from "../participant"

export interface SendMessageUseCase {
	execute(environment: AgenticEnvironment, message: string, caller: Participant): Promise<void>
}
