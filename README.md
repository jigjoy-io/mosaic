# Hexacore

A TypeScript library built with tsup.

## Installation

```bash
npm install @honeycomb-app/hexacore
```

```

## Workflow System

The library implements a flexible workflow system using the State Design Pattern, allowing you to create and manage complex workflows with multiple phases.

### Creating a Workflow

Here's a simple example of creating and executing a workflow:

```typescript
import { 
    WorkflowPhaseRegistry, 
    Workflow,
    FirstPhase,
    SecondPhase
} from '@honeycomb-app/hexacore';

// Register the workflow phases
WorkflowPhaseRegistry.register(FirstPhase);
WorkflowPhaseRegistry.register(SecondPhase);

// Create a workflow starting with FirstPhase
const workflow = new Workflow(new FirstPhase());

// Execute the workflow
await workflow.execute({
    input: "some input"
});
```

### Workflow Components

1. **WorkflowPhaseRegistry**: Manages available workflow phases
   - Use `register()` to add new phases
   - Phases can be registered dynamically

2. **Workflow**: The main context class that manages the workflow execution
   - Takes an initial phase in the constructor
   - Provides the `execute()` method to run the workflow

3. **Workflow Phases**: Individual states in the workflow
   - Each phase implements specific business logic
   - Phases can transition to other phases

### Creating Custom Phases

To create a custom workflow phase:

```typescript
import { WorkflowPhase } from '@honeycomb-app/hexacore';

class FirstPhase extends WorkflowPhase {
    async execute(input: any): Promise<void> {
        // Do some work
        console.log("Executing FirstPhase with input:", input);
        
        // Transition to next phase with updated state
        this.transitionTo("SecondPhase", {
            processed: true,
            result: "First phase completed"
        });
    }
}

class SecondPhase extends WorkflowPhase {
    async execute(input: any): Promise<void> {
        // Access the input passed from the previous phase
        console.log("Executing SecondPhase with input:", input);
    }
}
```

### Best Practices

1. Always register your phases before executing the workflow
2. Keep phase logic focused and single-responsibility
3. Implement proper error handling in your phases
4. Handle edge cases explicitly
5. Use meaningful phase names when transitioning
6. Pass necessary data between phases using the transitionTo method

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the library:
```bash
npm run build
```

3. Development mode with watch:
```bash
npm run dev
```

## License

MIT
