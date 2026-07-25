import { createBehavior } from "@app/use-cases/create-behavior"
import { FreemiumAvailable } from "./constraints"
import { FreemiumAction } from "./action"
import { createAgent } from "@app/use-cases/create-agent"

const freemium = createBehavior({
	constraint: new FreemiumAvailable(),
	actions: [new FreemiumAction()],
})

const agent = createAgent({
	manifest: {
		name: "Agent",
		instruction: "You are a helpful assistant.",
		tools: [],
	},
	behaviors: [freemium],
})

export { agent }
