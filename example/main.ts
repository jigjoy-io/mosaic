import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { agent } from "./agent"
import { EnvironmentState, FreemiumAccount, initializeRuntime } from "./runtime"
import { user } from "./user"

const freemiumAccount = FreemiumAccount.init(3)
const config = {
	state: new EnvironmentState(freemiumAccount),
}

const runtime = initializeRuntime(config)

runtime.join(user)
runtime.join(agent)

const userMessage: SemanticEvent = {
	type: "user.sent.message",
	producerId: user.getId(),
	occurredAt: new Date(),
	payload: {
		userId: user.getId(),
		message: "What is the capital of France?",
	},
}
runtime.deliver(userMessage)
