import { LoopState, LoopStateExecution } from "../loop-state"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

import type { Tool } from "@domain/generative-model/tool"
import type { ModelContext } from "@domain/model-context/model-context"
import type { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"

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
}

export class InferenceState implements LoopState<"inference"> {
	readonly id = "inference"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(input: InferenceInput): Promise<LoopStateExecution<"inference">> {
		const output = await this.inferenceRunner.run(input)

		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
