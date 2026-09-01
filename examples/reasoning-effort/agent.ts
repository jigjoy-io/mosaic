import type { Agent } from "@domain/agentic-environment/participant/agent"
import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createAgent, type InferenceInput } from "src"
import { runLoop } from "./runtime"

export class MessageSentSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "message.sent"
	}
}

export class InferenceProcessor implements SituationProcessor {
	apply(context: SituationContext): void {
		const { event, participant } = context

		const agent = participant as Agent
		const { message } = event.payload as { message: string }

		const inferenceInput: InferenceInput = {
			model: "gpt-5.4",
			reasoningEffort: "high",
			context: agent.getMemory().getContext(),
			tools: agent.getTools(),
		}

		runLoop(agent.getId(), message, inferenceInput)
	}
}

const situationHandler: SituationHandler = {
	specification: new MessageSentSpecification(),
	processor: new InferenceProcessor(),
}

const agent = createAgent({
	name: "Reasoning Agent",
	capabilities: [],
	instruction:
		"You are a finance analyst. Think carefully about capital-allocation trade-offs before answering. Show your conclusion clearly.",
	tools: [],
	handlers: [situationHandler],
})

export { agent }
