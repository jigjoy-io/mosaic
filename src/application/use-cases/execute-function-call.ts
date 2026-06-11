import type { FunctionCallRunner } from "@app/services/function-call-runner"
import type { AgenticEnvironment } from "@domain/agentic-environment/agentic-environment"
import type { Participant } from "@domain/agentic-environment/participant"
import type { ExecuteFunctionCallUseCase } from "@domain/agentic-environment/use-cases/execute-function-call"
import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

export class ExecuteFunctionCall implements ExecuteFunctionCallUseCase {
	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async execute(
		environment: AgenticEnvironment,
		functionCallItem: FunctionCallItem,
		tool: Tool,
		caller: Participant,
		signal?: AbortSignal,
	): Promise<void> {
		const stream = this.functionCallRunner.run(functionCallItem, tool, signal)

		for await (const item of stream) {
			environment.deliverFunctionCallOutput(caller, item)
		}
	}
}
