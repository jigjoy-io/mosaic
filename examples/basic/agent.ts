import {
	SituationContext,
	SituationHandler,
	SituationProcessor,
} from "@domain/agentic-environment/situation/situation-handler"
import { SituationSpecification } from "@domain/agentic-environment/situation/situation-specification"
import { createAgent, InferenceInput } from "src"
import { resolveRuntime, runLoop } from "./runtime"
import { Agent } from "@domain/agentic-environment/participant/agent"
import { MessageSentEvent } from "@domain/agentic-environment/semantic-event/event"

export class FremiumSpecification extends SituationSpecification {
	isSatisfiedBy(situationContext: SituationContext): boolean {
		const { event } = situationContext

		if (event.type !== "message.sent") {
			return false
		}

		const runtime = resolveRuntime()

		const numberOfTry = runtime.state.freemiumAccount.getNumberOfTry()
		const maxNumberOfTry = runtime.state.freemiumAccount.getMaxNumberOfTry()

		if (numberOfTry >= maxNumberOfTry) {
			throw new Error("Freemium account limit reached")
		}

		return true
	}
}

export class MessageProcessor implements SituationProcessor {
	apply(context: SituationContext<MessageSentEvent>) {
		const { event, participant } = context

		const message = event.payload.message as string

		const agent = participant as Agent

		const inferenceInput: InferenceInput = {
			model: "gpt-5.4",
			context: agent.getMemory().getContext(),
			tools: agent.getTools(),
		}
		runLoop(participant.getId(), message, inferenceInput)
	}
}

const situationHandler: SituationHandler = {
	specification: new FremiumSpecification(),
	processor: new MessageProcessor(),
}

const agent = createAgent({
	name: "Agent",
	capabilities: [],
	instruction: "You are a helpful assistant specilized solely for finance domain.",
	tools: [],
	handlers: [situationHandler],
})

export { agent }
