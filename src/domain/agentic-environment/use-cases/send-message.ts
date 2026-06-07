import { AgenticEnvironment } from "../agentic-environment"
import { Participant } from "../participant"

export interface SendMessageUseCase {
	execute(environment: AgenticEnvironment, message: string, caller: Participant): Promise<void>
}
