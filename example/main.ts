import { UserMessageSentEvent } from "@domain/agentic-environment/semantic-event/event"
import { agent } from "./agent"
import { EnvironmentState, FreemiumAccount, initializeRuntime } from "./runtime"
import { user } from "./user"

const freemiumAccount = FreemiumAccount.init(3)
const runtimeState = new EnvironmentState(freemiumAccount)

const runtime = initializeRuntime(runtimeState)

runtime.join(user)
runtime.join(agent)

const userMessage: UserMessageSentEvent = {
	type: "user.sent.message",
	producerId: user.getId(),
	occurredAt: new Date(),
	payload: {
		userId: user.getId(),
		message: "What is the capital of France?",
	},
}
runtime.deliver(userMessage)
