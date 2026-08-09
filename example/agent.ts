import { createAgent } from "src"

const agent = createAgent({
	name: "Agent",
	capabilities: [],
	instruction: "You are a helpful agent that can review code.",
	tools: [],
})

export { agent }
