import "dotenv/config"
import { McpToolRegistry } from "src"
import { createMcpAgent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { startMarketMcpServer } from "./server"
import { user, whenAnswered } from "./user"

async function main() {
	const server = await startMarketMcpServer()
	const registry = new McpToolRegistry([{ url: server.url }])

	try {
		const tools = await registry.discoverTools()
		console.log("MCP server:", server.url)
		console.log("Discovered MCP tools:", tools.map((tool) => tool.name).join(", ") || "(none)")

		initializeRuntime({ state: new EnvironmentState() })

		const agent = createMcpAgent(tools)
		join(user)
		join(agent)

		sendMessage("What is the current price of NVDA?", user.getId())
		await whenAnswered
	} finally {
		await registry.close()
		await server.close()
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
