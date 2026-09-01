import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { z } from "zod"

const QUOTES: Record<string, { price: number; currency: string; changePercent: number }> = {
	AAPL: { price: 227.52, currency: "USD", changePercent: 1.14 },
	MSFT: { price: 418.1, currency: "USD", changePercent: -0.32 },
	NVDA: { price: 131.28, currency: "USD", changePercent: 2.07 },
}

function createMarketMcpServer(): McpServer {
	const server = new McpServer({ name: "market-mcp", version: "1.0.0" })

	server.registerTool(
		"get_stock_quote",
		{
			description: "Look up the latest quote for a publicly traded stock by ticker symbol.",
			inputSchema: {
				ticker: z.string().describe("The stock ticker symbol, for example AAPL or MSFT."),
			},
		},
		async ({ ticker }) => {
			const quote = QUOTES[ticker.toUpperCase()]
			const payload = quote
				? { ticker: ticker.toUpperCase(), ...quote, asOf: new Date().toISOString() }
				: { error: `No quote found for ticker "${ticker}".` }

			return {
				content: [{ type: "text", text: JSON.stringify(payload) }],
			}
		},
	)

	return server
}

async function readJson(req: IncomingMessage): Promise<unknown> {
	const chunks: Buffer[] = []

	for await (const chunk of req) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
	}

	const raw = Buffer.concat(chunks).toString("utf8")
	return raw ? JSON.parse(raw) : undefined
}

export async function startMarketMcpServer(): Promise<{ url: string; close: () => Promise<void> }> {
	const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
		if (req.method !== "POST" || req.url !== "/mcp") {
			res.writeHead(405, { Allow: "POST" }).end()
			return
		}

		try {
			const body = await readJson(req)
			const mcpServer = createMarketMcpServer()
			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
				enableJsonResponse: true,
			})

			await mcpServer.connect(transport)
			await transport.handleRequest(req, res, body)

			res.on("close", () => {
				void transport.close()
				void mcpServer.close()
			})
		} catch (error) {
			console.error("MCP request failed:", error)
			if (!res.headersSent) {
				res.writeHead(500, { "Content-Type": "application/json" }).end(
					JSON.stringify({
						jsonrpc: "2.0",
						error: { code: -32603, message: "Internal server error" },
						id: null,
					}),
				)
			}
		}
	})

	await new Promise<void>((resolve, reject) => {
		httpServer.listen(0, "127.0.0.1", () => resolve())
		httpServer.once("error", reject)
	})

	const address = httpServer.address()
	if (!address || typeof address === "string") {
		throw new Error("Failed to bind the local MCP server")
	}

	return {
		url: `http://127.0.0.1:${address.port}/mcp`,
		close: () =>
			new Promise((resolve, reject) => {
				httpServer.close((error) => (error ? reject(error) : resolve()))
			}),
	}
}
