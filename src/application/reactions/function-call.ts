import type { FunctionCallRunner } from "@app/services/function-call-runner"
import type { Channel } from "@domain/agentic-environment/channel"
import { FunctionCallExecuted } from "@domain/agentic-environment/events/function-call"
import { Reaction, type Participant } from "@domain/agentic-environment/participant"
import type { Tool } from "@domain/generative-model/tool"
import type { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"

export class FunctionCall extends Reaction {
	constructor(private readonly functionCallRunner: FunctionCallRunner) {
		super()
	}

	async *execute({
		channel,
		functionCallItem,
		tool,
		caller,
		signal,
	}: {
		channel: Channel
		functionCallItem: FunctionCallItem
		tool: Tool
		caller: Participant
		signal?: AbortSignal
	}): AsyncIterable<SemanticEvent> {
		const stream = this.functionCallRunner.run(functionCallItem, tool, signal)

		for await (const item of stream) {
			const manifest = caller.getManifest()
			channel.deliver(FunctionCallExecuted.create({ producerId: manifest.getId(), output: item }))
		}
	}
}
