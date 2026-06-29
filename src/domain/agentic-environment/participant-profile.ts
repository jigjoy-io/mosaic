import { Tool } from "@domain/generative-model/tool"

export class ParticipantManifest<T> {
	readonly id: string
	readonly name: string
	readonly details: T

	constructor(id: string, name: string, details: T) {
		this.id = id
		this.name = name
		this.details = details
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name
	}

	getDetails(): T {
		return this.details
	}

	create({ id, name, details }: { id: string; name: string; details: T }): Profile<T> {
		return new ParticipantManifest(id, name, details)
	}
}

export class AgentProfile extends Profile<{ instruction: string; tools: Tool[] }> {
	instruction: string
	tools: Tool[]

	constructor(id: string, name: string, instruction: string, tools: Tool[] = []) {
		super(id, name, { instruction, tools })
		this.instruction = instruction
		this.tools = tools
	}
}
