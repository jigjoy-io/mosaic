import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { Memory } from "./memory"
import { ModelContext } from "@domain/model-context/model-context"

export class Agent extends Participant {
	private readonly context: ModelContext

	constructor(
		id: string,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
		memory: Memory,
		context: ModelContext,
	) {
		super(id, manifest, behaviors, memory)
		this.context = context
	}

	static create({
		manifest,
		behaviors,
		memory,
	}: {
		manifest: AgentManifest
		behaviors: readonly Behavior[]
		memory: Memory
	}): Agent {
		const id = crypto.randomUUID()
		const context = ModelContext.create()
		return new Agent(id, manifest, behaviors, memory, context)
	}
}
