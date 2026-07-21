import { Tool } from "@domain/generative-model/tool"

export class ParticipantManifest {
	readonly id: string
	readonly name: string

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name
	}

	create({ id, name }: { id: string; name: string }): ParticipantManifest {
		return new ParticipantManifest(id, name)
	}
}

export class AgentManifest extends ParticipantManifest {
	instruction: string
	tools: Tool[]

	constructor(id: string, name: string, instruction: string, tools: Tool[] = []) {
		super(id, name)
		this.instruction = instruction
		this.tools = tools
	}

	static create({
		id,
		name,
		instruction,
		tools,
	}: {
		id: string
		name: string
		instruction: string
		tools: Tool[]
	}): AgentManifest {
		return new AgentManifest(id, name, instruction, tools)
	}
}
