import { ModelContext } from "@domain/model-context/model-context"
import { AgentManifest } from "../participant-manifest"
import { Participant } from "../participant"
import { Behavior } from "../behavior/behavior"

export abstract class Agent extends Participant {
	constructor(
		readonly context: ModelContext,
		manifest: AgentManifest,
		behaviors: readonly Behavior[],
	) {
		super(manifest, behaviors)
	}
}
