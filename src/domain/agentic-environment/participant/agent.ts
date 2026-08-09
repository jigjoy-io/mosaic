import { Memory } from "./memory"
import { Participant, ParticipantManifest } from "./participant"
import { Tool } from "@domain/generative-model/tool"

export class Agent extends Participant {
	private memory: Memory
	private developerMessage: string
	private tools: Tool[]

	constructor(id: string, developerMessage: string, tools: Tool[], manifest: ParticipantManifest, memory: Memory) {
		super(id, manifest)
		this.memory = memory
		this.developerMessage = developerMessage
		this.tools = tools
	}

	static create({
		instruction,
		tools,
		name,
		capabilities,
	}: {
		instruction: string
		tools: Tool[]
		name: string
		capabilities: readonly string[]
	}): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		const manifest: ParticipantManifest = { name, capabilities, role: "agent" }

		memory.getContext().addDeveloperMessage(instruction)
		return new Agent(id, instruction, tools, manifest, memory)
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
