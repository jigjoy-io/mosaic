import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"
import { WorkingMemory } from "./memory"

export class Agent extends Participant {
	static create({
		manifest,
		behaviors,
		workingMemory,
	}: {
		manifest: AgentManifest
		behaviors: readonly Behavior[]
		workingMemory: WorkingMemory
	}): Agent {
		return Agent.create({
			manifest,
			behaviors,
			workingMemory,
		})
	}
}
