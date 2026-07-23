import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { Contract, Memory } from "./memory"
import { ModelContext } from "@domain/model-context/model-context"

export class Agent extends Participant {
	constructor(
		id: string,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
		memory: AgentMemory,
		contract: Contract,
	) {
		super(id, manifest, behaviors, memory, contract)
	}

	static create({
		manifest,
		behaviors,
		contract,
	}: {
		manifest: AgentManifest
		behaviors: readonly Behavior[]
		contract: Contract
	}): Agent {
		const id = crypto.randomUUID()
		const memory = AgentMemory.create()
		return new Agent(id, manifest, behaviors, memory, contract)
	}
}

export class AgentMemory extends Memory {
	private readonly context: ModelContext
	constructor(context: ModelContext) {
		super()
		this.context = context
	}

	getContext(): ModelContext {
		return this.context
	}

	static create(): AgentMemory {
		const context = ModelContext.create()
		return new AgentMemory(context)
	}
}
