import { Memory } from "./memory"
import { Participant, ParticipantManifest } from "./participant"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "../situation/situation-handler"

export class Agent extends Participant {
	private memory: Memory
	private developerMessage: string
	private tools: Tool[]

	constructor(
		manifest: ParticipantManifest,
		developerMessage: string,
		tools: Tool[],
		memory: Memory,
		handlers: SituationHandler[],
	) {
		super(manifest, handlers)
		this.memory = memory
		this.developerMessage = developerMessage
		this.tools = tools
	}

	static create({
		instruction,
		tools,
		name,
		capabilities,
		handlers,
	}: {
		instruction: string
		tools: Tool[]
		name: string
		capabilities: readonly string[]
		handlers: SituationHandler[]
	}): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "agent" }

		memory.getContext().addDeveloperMessage(instruction)
		return new Agent(manifest, instruction, tools, memory, handlers)
	}

	getTools(): Tool[] {
		return this.tools
	}

	getDeveloperMessage(): string {
		return this.developerMessage
	}

	getMemory(): Memory {
		return this.memory
	}
}
