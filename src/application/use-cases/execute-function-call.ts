import type { FunctionCallRunner } from "@app/services/function-call-runner"
import type { Channel } from "@domain/agentic-environment/channel"
import type { Participant } from "@domain/agentic-environment/participant"
import type { ExecuteFunctionCallUseCase } from "@domain/agentic-environment/use-cases/execute-function-call"
import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class ExecuteFunctionCall implements ExecuteFunctionCallUseCase {
	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async execute(
		channel: Channel,
		functionCallItem: FunctionCallItem,
		tool: Tool,
		caller: Participant,
		signal?: AbortSignal,
	): Promise<void> {
		const stream = this.functionCallRunner.run(functionCallItem, tool, signal)

		for await (const item of stream) {
			const profile = caller.getProfile()
			channel.deliver(
				SemanticEvent.create({ type: "function_call_output", producerId: profile.getId(), data: item }),
			)
		}
	}
}
