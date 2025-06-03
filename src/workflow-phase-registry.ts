import { WorkflowPhase } from "./workflow-phase"

type PhaseConstructor = new () => WorkflowPhase

export class WorkflowPhaseRegistry {
    private static phases: Map<string, PhaseConstructor> = new Map()

    static register(phase: PhaseConstructor) {
		const instance: WorkflowPhase = new phase()
		this.phases.set(instance.name, phase)
    }

    static get(name: string): WorkflowPhase {
		const Phase = this.phases.get(name)
		if (!Phase) {
			throw new Error(`Phase "${name}" not found in registry.`)
		}
		return new Phase()
    }
}