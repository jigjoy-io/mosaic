import { Tool } from "@domain/generative-model/tool"
import { ParticipantManifest } from "./participant-manifest"

export type AgentManifestParams = {
	name: string
	instruction: string
	tools: Tool[]
}

export class AgentManifest extends ParticipantManifest {
	instruction: string
	tools: Tool[]

	constructor(name: string, instruction: string, tools: Tool[] = []) {
		super(name)
		this.instruction = instruction
		this.tools = tools
	}

	getTools(): Tool[] {
		return this.tools
	}

	static create({ name, instruction, tools }: AgentManifestParams): AgentManifest {
		return new AgentManifest(name, instruction, tools)
	}
}
