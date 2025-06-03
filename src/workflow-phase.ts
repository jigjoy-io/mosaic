import { WorkflowContext } from "./workflow-context"
import { WorkflowPhaseRegistry } from "./workflow-phase-registry"

/**
 * Abstract class for workflow phases.
 * 
 * @template T - The type of data (state) that the phase can handle.
 */
export abstract class WorkflowPhase<T = any>  {
    abstract name: string;
    protected context !: WorkflowContext
    protected data!: T
  
    setContext(context: WorkflowContext) {
      this.context = context
    }
  
    /**
     * Sets the data for the phase.
     * 
     * @param data - The data to set for the phase.
     */
    setData(data: T) {
      this.data = data
    }

    /**
     * Transitions to a new phase.
     * 
     * @param name - The name of the phase to transition to.
     * @param data - The data to pass to the new phase.
     */
    transitionTo(name: string, data?: any) {
        const phase = WorkflowPhaseRegistry.get(name)
        if (!phase) throw new Error(`Phase "${name}" not found in registry.`)
        this.context.transitionTo(phase, data)
    }
  
    abstract execute(input: any): any
  }