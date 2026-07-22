import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { WorkingMemory } from "./memory"
import { ModelContext } from "@domain/model-context/model-context"

export class Agent extends Participant {
	private readonly context: ModelContext

	constructor(
		id: string,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
		workingMemory: WorkingMemory,
		context: ModelContext,
	) {
		super(id, manifest, behaviors, workingMemory)
		this.context = context
	}

	static create({
		manifest,
		behaviors,
		workingMemory,
	}: {
		manifest: AgentManifest
		behaviors: readonly Behavior[]
		workingMemory: WorkingMemory
	}): Agent {
		const id = crypto.randomUUID()
		const context = ModelContext.create()
		return new Agent(id, manifest, behaviors, workingMemory, context)
	}
}
