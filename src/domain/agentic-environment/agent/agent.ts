import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { EventProcessor } from "../behavior/event-processor"
import { Memory } from "./memory"

export class Agent extends Participant {
	readonly manifest: AgentManifest

	constructor(id: string, manifest: AgentManifest, eventProcessors: readonly EventProcessor[], memory: Memory) {
		super(id, manifest, eventProcessors, memory)
		this.manifest = manifest
	}

	getManifest(): AgentManifest {
		return this.manifest
	}

	static create({
		manifest,
		eventProcessors,
	}: {
		manifest: AgentManifest
		eventProcessors: readonly EventProcessor[]
	}): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		return new Agent(id, manifest, eventProcessors, memory)
	}
}
