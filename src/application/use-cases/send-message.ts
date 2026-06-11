import type { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import type { Participant } from "@domain/agentic-environment/participant"
import type { SendMessageUseCase } from "@domain/agentic-environment/use-cases/send-message"

export class SendMessage implements SendMessageUseCase {
	async execute(environment: AgenticEnvironment, message: string, caller: Participant): Promise<void> {
		if (!caller.isJoinedTo(environment)) {
			throw new Error("Not joined to environment")
		}

		environment.deliverMessage(caller, message)
	}
}
