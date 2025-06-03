import { Workflow } from "./workflow"
import { WorkflowPhaseRegistry } from "./workflow-phase-registry"

/**
 * Abstract class for workflow phases.
 * 
 * @template T - The type of data (state) that the phase can handle.
 */
export abstract class WorkflowPhase<T = any>  {
    abstract name: string;
    protected workflow !: Workflow
    protected data!: T
  
    setContext(workflow: Workflow) {
      this.workflow = workflow
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
        this.workflow.transitionTo(phase, data)
    }
  
    abstract execute(input: any): any
  }