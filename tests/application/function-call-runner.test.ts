import { describe, it, expect } from "@rstest/core"
import { FunctionCallRunner } from "@app/services/function-call-runner"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import type { Tool } from "@domain/generative-model/tool"

function makeTool(name: string, invoke: (args: any) => Promise<any>): Tool {
	return { type: "function", name, description: "", parameters: {}, strict: true, invoke }
}

async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = []
	for await (const item of stream) out.push(item)
	return out
}

describe("FunctionCallRunner", () => {
	it("parses the call args, invokes the tool, and yields its stringified result", async () => {
		let receivedArgs: unknown
		const tool = makeTool("add", async (args) => {
			receivedArgs = args
			return { sum: args.a + args.b }
		})
		const runner = new FunctionCallRunner()
		const call = FunctionCallItem.rehydrate({ callId: "call_1", name: "add", args: '{"a":1,"b":2}' })

		const outputs = await collect(runner.run(call, tool))

		expect(receivedArgs).toEqual({ a: 1, b: 2 })
		expect(outputs).toHaveLength(1)
		expect(outputs[0]).toBeInstanceOf(FunctionCallOutputItem)
		expect(outputs[0].type).toBe("function_call_output")
		expect(outputs[0].callId).toBe("call_1")
		expect(outputs[0].output.text).toBe('{"sum":3}')
	})

	it("throws when no tool is provided", async () => {
		const runner = new FunctionCallRunner()
		const call = FunctionCallItem.rehydrate({ callId: "c", name: "missing", args: "{}" })

		await expect(collect(runner.run(call, undefined as any))).rejects.toThrow("Unknown tool: missing")
	})

	it("does nothing when the abort signal is already aborted", async () => {
		let ran = false
		const tool = makeTool("fn", async () => {
			ran = true
			return null
		})
		const runner = new FunctionCallRunner()
		const call = FunctionCallItem.rehydrate({ callId: "c", name: "fn", args: "{}" })

		const outputs = await collect(runner.run(call, tool, AbortSignal.abort()))

		expect(outputs).toEqual([])
		expect(ran).toBe(false)
	})
})
