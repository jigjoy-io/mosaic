import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createHuman, type ModelMessageItem } from "src"

/**
 * `inference.stream` carries the provider's raw chunk, so the shape is
 * provider-specific. These fields are the OpenAI Responses stream events.
 */
type ResponsesStreamChunk = {
	type?: string
	delta?: string
}

export class InferenceStreamSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "inference.stream"
	}
}

export class TokenRenderer implements SituationProcessor {
	private deltaCount = 0

	apply(context: SituationContext): void {
		const chunk = context.event.payload as ResponsesStreamChunk

		if (chunk.type === "response.output_text.delta" && chunk.delta) {
			if (this.deltaCount === 0) {
				process.stdout.write("\nStreamed answer: ")
			}

			this.deltaCount++
			process.stdout.write(chunk.delta)
		}

		if (chunk.type === "response.completed") {
			process.stdout.write(`\n\nReceived ${this.deltaCount} text deltas.\n`)
		}
	}
}

export class ModelAnswerSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "model.answer"
	}
}

export class ModelAnswerRenderer implements SituationProcessor {
	apply(context: SituationContext): void {
		const { answer } = context.event.payload as { answer: ModelMessageItem }

		console.log("Final answer: ", answer.content.text)
	}
}

const streamHandler: SituationHandler = {
	specification: new InferenceStreamSpecification(),
	processor: new TokenRenderer(),
}

const answerHandler: SituationHandler = {
	specification: new ModelAnswerSpecification(),
	processor: new ModelAnswerRenderer(),
}

const user = createHuman({
	name: "Miodrag",
	capabilities: ["make_investment_decision"],
	handlers: [streamHandler, answerHandler],
})

export { user }
