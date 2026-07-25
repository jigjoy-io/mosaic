import { Behavior } from "./behavior"
import { Memory } from "../participant/memory"
import { Participant } from "../participant/participant"
import { AgentManifest } from "../participant/participant-manifest"

export class Agent extends Participant {
	readonly manifest: AgentManifest

	constructor(id: string, manifest: AgentManifest, behaviors: readonly Behavior[], memory: Memory) {
		super(id, manifest, behaviors, memory)
		this.manifest = manifest
	}

	getManifest(): AgentManifest {
		return this.manifest
	}

	static create({ manifest, behaviors }: { manifest: AgentManifest; behaviors: readonly Behavior[] }): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		return new Agent(id, manifest, behaviors, memory)
	}
}
