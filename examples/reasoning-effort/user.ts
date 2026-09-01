import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createHuman, type InferenceOutput, type ModelMessageItem, type ReasoningItem } from "src"

export class InferenceCompletedSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "inference.completed"
	}
}

export class ReasoningRenderer implements SituationProcessor {
	apply(context: SituationContext): void {
		const output = context.event.payload as InferenceOutput
		const reasoningItems = output.items.filter((item): item is ReasoningItem => item.type === "reasoning")

		console.log(`Received ${reasoningItems.length} reasoning item(s).`)

		for (const item of reasoningItems) {
			for (const summary of item.summary) {
				console.log("Reasoning summary:", summary.text)
			}
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

		console.log("Final answer:", answer.content.text)
	}
}

const reasoningHandler: SituationHandler = {
	specification: new InferenceCompletedSpecification(),
	processor: new ReasoningRenderer(),
}

const answerHandler: SituationHandler = {
	specification: new ModelAnswerSpecification(),
	processor: new ModelAnswerRenderer(),
}

const user = createHuman({
	name: "Miodrag",
	capabilities: ["make_investment_decision"],
	handlers: [reasoningHandler, answerHandler],
})

export { user }
