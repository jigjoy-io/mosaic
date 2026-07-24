import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { Memory } from "./memory"

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
