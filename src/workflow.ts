import { WorkflowPhase } from "./workflow-phase"

export class Workflow {
    private currentPhase: WorkflowPhase
  
    /**
     * Constructor for the WorkflowContext.
     * 
     * @param initialPhase - The initial phase to start the workflow with.
     * @param initialData - Optional initial data to pass to the first phase.
     */
    constructor(initialPhase: WorkflowPhase, initialData?: any) {
        this.currentPhase = initialPhase
        this.currentPhase.setContext(this)
        if (initialData) {
            this.currentPhase.setData(initialData)
        }
    }

    /**
     * Transition to a new phase and pass stateful data
     */
    transitionTo(phase: WorkflowPhase, data?: any) {
        console.log(`[Transition] → ${phase.name}`)
        this.currentPhase = phase;
        this.currentPhase.setContext(this)
        if (data !== undefined) {
            this.currentPhase.setData(data)
        }
        this.currentPhase.execute(data)
    }
  
    /**
     * Entrypoint: delegate input to the current phase
     */
    execute(input: any): Promise<any> {
        return this.currentPhase.execute(input)
    }
  
    /**
     * Get current phase (optional utility)
     */
    getCurrentPhase(): WorkflowPhase {
        return this.currentPhase
    }
}
  






