# Hexacore

**Hexacore** is a lightweight library for building multi-agent workflows using a simple object-oriented approach. Each AI contributor is a class that defines how the AI should think, what it should return, and how it can delegate to others.

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

## 🧠 What’s a Contributor?

A **Contributor** is a class with:

- A name and an AI model (`brain`)
- A context string (what role the AI plays)
- A Zod schema (what you expect as output)
- Optional delegation to other contributors

## Example

Example: Delegation Flow with Change Request and Implementation

```ts
import { Contributor, Brain } from "@honeycomb-app/hexacore"
import { z } from "zod"

export class ProductOwner extends Contributor {
  name = "ProductOwner"
  brain = Brain.GPT_41_NANO

  thoughtShape = z.object({
    refinedTask: z.object({
      title: z.string(),
      description: z.string()
    }),
  })

  constructor(private changeRequest: string) {
    super()
  }

  loadContext(): string {
    return `You receive this user change request:\n${this.changeRequest}\nCreate a clear task with title and description.`
  }

  async afterThought(thought: z.infer<typeof this.thoughtShape>) {
    // Delegate the refined task to Developer
    const implementation = await this.delegateTo("Developer", thought.refinedTask)
    return { refinedTask: thought.refinedTask, implementation }
  }
}

```

---

### Define Developer contributor

```ts
import { Brain, Contributor } from "@honeycomb-app/hexacore"
import { z } from "zod"

export class Developer extends Contributor {
  name = "Developer"
  brain = Brain.GPT_41

  thoughtShape = z.object({
    implementationPlan: z.string()
  })

  private task: { title: string; description: string } | null = null

  async preThought(task: { title: string; description: string }) {
    this.task = task
  }

  loadContext(): string {
    return `You are a developer. Based on the project details below, create an implementation plan:\n${JSON.stringify(this.task)}`
  }

  async afterThought(thought: z.infer<typeof this.thoughtShape>) {
    return thought.implementationPlan
  }
}
```

Make sure to register them into team:

```ts
import { Team, Contributor } from "@honeycomb-app/hexacore"
import { Developer } from "./developer"
import { ProductOwner } from "./po"

import dotenv from "dotenv"
dotenv.config()

const changeRequest = "Add login feature with secure authentication."

const productOwner: Contributor = new ProductOwner(changeRequest)
const developer: Contributor = new Developer()

Team.addContributor(productOwner)
Team.addContributor(developer)

async function run() {
  const result = await productOwner.execute(changeRequest)
  console.log("Refined Task:", result.refinedTask)
  console.log("Implementation Plan:", result.implementation)
}

run()
```

See [hexacore-examples](https://github.com/Mijura/hexacore-examples) for working demos.

---

## Philosophy

- **Object-oriented**: Just classes.
- **Structured**: Every contributor returns typed, validated data.
- **Composable**: Contributors can call each other.

---

## Author & License

Created by [JigJoy](https://jigjoy.io) team\
Licensed under the MIT License.
