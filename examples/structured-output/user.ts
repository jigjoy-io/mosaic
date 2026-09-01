import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createHuman, type ModelMessageItem } from "src"

export class ModelAnswerSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "model.answer"
	}
}

export class StructuredAnswerRenderer implements SituationProcessor {
	apply(context: SituationContext): void {
		const { answer } = context.event.payload as { answer: ModelMessageItem }
		const raw = answer.content.text

		try {
			console.log("Structured answer:", JSON.parse(raw))
		} catch {
			console.log("Unparsed answer:", raw)
		}
	}
}

const answerHandler: SituationHandler = {
	specification: new ModelAnswerSpecification(),
	processor: new StructuredAnswerRenderer(),
}

const user = createHuman({
	name: "Miodrag",
	capabilities: ["make_investment_decision"],
	handlers: [answerHandler],
})

export { user }
