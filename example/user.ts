import { ModelAnswerEvent } from "@domain/agentic-environment/semantic-event/event"
import { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import { SituationContext, SituationSpecification } from "@domain/agentic-environment/situation/situation-specification"
import { createHuman } from "src"

export class ModelAnswerSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "model.answer"
	}
}

export class ModelAnswerProcessor implements SituationProcessor {
	apply(context: SituationContext<ModelAnswerEvent>): void {
		console.log("Model answer: ", context.event.payload.answer)
	}
}

const situationHandler: SituationHandler = {
	specification: new ModelAnswerSpecification(),
	processor: new ModelAnswerProcessor(),
}

const user = createHuman({
	name: "Miodrag",
	capabilities: ["make_investment_decision"],
	handlers: [situationHandler],
})

export { user }
