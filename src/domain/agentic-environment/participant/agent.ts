import { Memory } from "./memory"
import { Participant } from "./participant"
import { AgentManifest } from "./agent-manifest"

export class Agent extends Participant {
	readonly manifest: AgentManifest

	constructor(id: string, manifest: AgentManifest, memory: Memory) {
		super(id, manifest, memory)
		this.manifest = manifest
	}

	getManifest(): AgentManifest {
		return this.manifest
	}

	static create({ manifest }: { manifest: AgentManifest }): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		return new Agent(id, manifest, memory)
	}
}
