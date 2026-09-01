import type { Agent } from "@domain/agentic-environment/participant/agent"
import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createAgent, type InferenceInput } from "src"
import { runLoop } from "./runtime"
import { investmentBrief } from "./schema"

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
			context: agent.getMemory().getContext(),
			tools: agent.getTools(),
			structuredOutput: investmentBrief,
		}

		runLoop(agent.getId(), message, inferenceInput)
	}
}

const situationHandler: SituationHandler = {
	specification: new MessageSentSpecification(),
	processor: new InferenceProcessor(),
}

const agent = createAgent({
	name: "Research Agent",
	capabilities: [],
	instruction:
		"You are a finance research assistant. Answer with an investment brief that matches the provided schema. Do not add fields outside the schema.",
	tools: [],
	handlers: [situationHandler],
})

export { agent }
