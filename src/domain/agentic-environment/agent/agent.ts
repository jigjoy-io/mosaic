import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { Contract, Memory } from "./memory"

export class Agent extends Participant {
	constructor(
		id: string,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
		memory: Memory,
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
		const memory = Memory.create()
		return new Agent(id, manifest, behaviors, memory, contract)
	}
}
