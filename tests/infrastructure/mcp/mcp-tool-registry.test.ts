import { describe, it, expect } from "@rstest/core"
import { McpToolRegistry, type McpClientLike } from "@infra/mcp/mcp-tool-registry"
import type { McpServerConfig } from "@infra/mcp/mcp-client"

function fakeClient(overrides: Partial<McpClientLike> = {}): McpClientLike & { calls: Array<{ name: string; args: any }>; closed: boolean } {
	const self: McpClientLike & { calls: Array<{ name: string; args: any }>; closed: boolean } = {
		calls: [],
		closed: false,
		async listTools() {
			return [
				{ name: "create_issue", description: "Open an issue", inputSchema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } },
			]
		},
		async callTool(name: string, args: Record<string, any>) {
			self.calls.push({ name, args })
			return `called ${name}`
		},
		async close() {
			self.closed = true
		},
		...overrides,
	}
	return self
}

describe("McpToolRegistry", () => {
	it("exposes each MCP tool as a FunctionTool with its schema", async () => {
		const registry = new McpToolRegistry([{ url: "https://mcp.example/" }], () => fakeClient())
		const tools = await registry.discoverTools()

		expect(tools).toHaveLength(1)
		const tool = tools[0]
		expect(tool.type).toBe("function")
		expect(tool.name).toBe("create_issue")
		expect(tool.description).toBe("Open an issue")
		expect(tool.strict).toBe(false)
		expect(tool.parameters).toEqual({ type: "object", properties: { title: { type: "string" } }, required: ["title"] })
	})

	it("routes a FunctionTool.invoke() back to the MCP server's callTool", async () => {
		const client = fakeClient()
		const registry = new McpToolRegistry([{ url: "https://mcp.example/" }], () => client)
		const [tool] = await registry.discoverTools()

		const out = await tool.invoke({ title: "Bug" })

		expect(out).toBe("called create_issue")
		expect(client.calls).toEqual([{ name: "create_issue", args: { title: "Bug" } }])
	})

	it("aggregates tools across multiple servers", async () => {
		const servers: McpServerConfig[] = [{ url: "https://a/" }, { url: "https://b/" }]
		const registry = new McpToolRegistry(servers, () => fakeClient())
		const tools = await registry.discoverTools()
		expect(tools).toHaveLength(2)
	})

	it("closes every opened client", async () => {
		const clients: ReturnType<typeof fakeClient>[] = []
		const registry = new McpToolRegistry([{ url: "https://a/" }, { url: "https://b/" }], () => {
			const c = fakeClient()
			clients.push(c)
			return c
		})
		await registry.discoverTools()
		await registry.close()
		expect(clients.map((c) => c.closed)).toEqual([true, true])
	})
})
