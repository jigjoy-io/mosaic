# Hexacore — Build Modular AI Workers & Agentic Workflows

Hexacore is a powerful and lightweight framework for building **AI workers** and **multi-phase agentic workflows** using the **State Design Pattern**. It enables developers to modularize AI logic, manage context-rich interactions, and orchestrate complex agent behaviors with ease.

---

## 📦 Installation

```bash
yarn add @honeycomb-app/hexacore
```
---

## API Key Configuration

Make sure to set your OpenAI API key in a `.env` file at the root of your project:

```env
OPENAI_API_KEY=your-api-key-here
```
---

## Getting Started with AI Workers

AI Workers are self-contained, modular units of logic that encapsulate the entire thinking process of an agent: setting context, executing an LLM, and transforming the result.

Here’s how to build an AI Worker that refines project details from a raw task.

### ✅ Define Your AI Worker

```ts
import { z } from "zod"
import { ProjectDetails } from "@domain/types/project-details"
import { AIWorker, Brain } from "@honeycomb-app/hexacore"
import { Task } from "@domain/entities/task"

export class ProjectRefiner extends AIWorker {
  brain = Brain.GPT_41_NANO

  thoughtShape = z.object({
    project: z.object({
      name: z.string().describe("Short and concise title of the task."),
      description: z.string().describe("Concrete description what should be implemented, why it should be implemented and what shouldn't be implemented.")
    }),
  })

  task: Task

  constructor(task: Task) {
    super()
    this.task = task
  }

  loadContext(): string {
    return `
      ### Role:
      You are a product owner expert on React projects with Tailwind CSS and Framer Motion.
        
      ### **Your Task:**
      1) Analyze task title and task description provided by user.
      2) Based on the task details, create a project name and description.

      ### **Task Details:** ${JSON.stringify(this.task)}

      Important:
      - Respond only in valid JSON. The JSON object must match the schema below.

      ### **Output Format**
      ${JSON.stringify(this.thoughtShape.shape)}
    `
  }

  async afterThought(thought: z.infer<typeof this.thoughtShape>): Promise<ProjectDetails> {
    const { project } = thought
    return project
  }
}
```

### 🐝 Run Your AI Worker

```ts
const worker = new ProjectRefiner(task)
const projectDetails: ProjectDetails = await worker.execute(task)
```

The `execute` method wraps everything — from loading context, calling the AI, to transforming the output into your custom format.

---

## Agentic Workflows with State Transitions

You can build complex workflows by chaining multiple **AI Workers** using **workflow phases**. Each phase encapsulates a distinct responsibility and can transition to the next phase based on intermediate results.

### Create Custom Workflow Phases

Let’s say you want to:

1. Refine a task into a project description.
2. Generate a component list for that project using another AI worker.

```ts
import { WorkflowPhase } from "@honeycomb-app/hexacore"
import { ProjectRefiner } from "./workers/project-refiner"
import { ComponentGenerator } from "./workers/component-generator"

export class ProjectRefinementPhase extends WorkflowPhase {
  async execute(input: Task): Promise<void> {
    const project = await new ProjectRefiner(input).execute(input)

    this.transitionTo("ComponentGenerationPhase", { project })
  }
}

export class ComponentGenerationPhase extends WorkflowPhase {
  async execute(input: { project: ProjectDetails }): Promise<void> {
    const components = await new ComponentGenerator(input.project).execute(input.project)

    console.log("Generated components:", components)
  }
}
```

### Register and Run the Workflow

```ts
import { WorkflowPhaseRegistry, Workflow } from "@honeycomb-app/hexacore"

WorkflowPhaseRegistry.register(ProjectRefinementPhase)
WorkflowPhaseRegistry.register(ComponentGenerationPhase)

const workflow = new Workflow(new ProjectRefinementPhase())

await workflow.execute(task)
```

Each phase can decide where to transition next and pass along structured state — allowing flexible, dynamic, and intelligent workflows.

---

## When to Use Workflows

Use `Workflow` when your logic:

- Requires **multiple AI steps** (e.g., refine → plan → implement)
- Needs **different agents for different tasks**
- Benefits from **clear separation of responsibilities**
- Should support **early exits, retries, or decision points**

---

## Design Principles

- **Modular**: Workers and phases are small, composable units.
- **Declarative**: Context and schema are explicitly defined.
- **Extendable**: Easily add new phases or workers.
- **Type-safe**: Built with `zod` for runtime validation.

---

## Coming Soon

- Built-in support for logging and tracing

---

## Author & License

Created by [JigJoy](https://jigjoy.io) team\
Licensed under the MIT License.
