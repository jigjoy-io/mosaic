import { LoopState, LoopStateExecution } from "@domain/agentic-environment/loop/loop-state"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

import type { Tool } from "@domain/generative-model/tool"
import type { ModelContext } from "@domain/model-context/model-context"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export type InferenceInput = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
}

export type InferenceItem = FunctionCallItem | ReasoningItem | ModelMessageItem

export type InferenceOutput = {
	items: InferenceItem[]
	rowResponse: any
}

export interface InferenceRunner {
	run(request: InferenceInput): Promise<InferenceOutput>
	stream(request: InferenceInput): AsyncGenerator<SemanticEvent>
}

export class InferenceState implements LoopState<InferenceInput, LoopStateExecution<"inference">> {
	readonly id = "inference"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(input: InferenceInput, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"inference">> {
		loopVisitor.visitInferenceStarted(input)

		const output = await this.inferenceRunner.run(input)

		loopVisitor.visitInferenceCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
