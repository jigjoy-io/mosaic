import type { SituationHandler, SituationProcessor } from "@domain/agentic-environment/situation/situation-handler"
import {
	SituationSpecification,
	type SituationContext,
} from "@domain/agentic-environment/situation/situation-specification"
import { createHuman, type FunctionCallItem, type FunctionCallOutputItem, type ModelMessageItem } from "src"

export class FunctionCallStartedSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "function_call.started"
	}
}

export class FunctionCallStartedRenderer implements SituationProcessor {
	apply(context: SituationContext): void {
		const { call } = context.event.payload as { call: FunctionCallItem }

		console.log("Tool call:", call.name, call.args)
	}
}

export class FunctionCallCompletedSpecification extends SituationSpecification {
	isSatisfiedBy(context: SituationContext): boolean {
		return context.event.type === "function_call.completed"
	}
}

export class FunctionCallCompletedRenderer implements SituationProcessor {
	apply(context: SituationContext): void {
		const output = context.event.payload as FunctionCallOutputItem

		console.log("Tool result:", output.output.text)
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

const toolCallStartedHandler: SituationHandler = {
	specification: new FunctionCallStartedSpecification(),
	processor: new FunctionCallStartedRenderer(),
}

const toolCallCompletedHandler: SituationHandler = {
	specification: new FunctionCallCompletedSpecification(),
	processor: new FunctionCallCompletedRenderer(),
}

const answerHandler: SituationHandler = {
	specification: new ModelAnswerSpecification(),
	processor: new ModelAnswerRenderer(),
}

const user = createHuman({
	name: "Miodrag",
	capabilities: ["make_investment_decision"],
	handlers: [toolCallStartedHandler, toolCallCompletedHandler, answerHandler],
})

export { user }
