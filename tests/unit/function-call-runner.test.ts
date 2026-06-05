import { describe, it, expect } from "@rstest/core"
import { DefaultFunctionCallRunner } from "@app/runners/function-call-runner"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { Tool } from "@domain/generative-model/tool"

function makeTool(name: string, invoke: (args: any) => Promise<any>): Tool {
	return { type: "function", name, description: "", parameters: {}, strict: true, invoke }
}

async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> {
	const out: T[] = []
	for await (const item of stream) out.push(item)
	return out
}

describe("DefaultFunctionCallRunner", () => {
	it("parses the call args, invokes the matching tool, and yields its stringified result", async () => {
		let receivedArgs: unknown
		const tool = makeTool("add", async (args) => {
			receivedArgs = args
			return { sum: args.a + args.b }
		})
		const runner = new DefaultFunctionCallRunner([tool])
		const call = FunctionCallItem.rehydrate({ callId: "call_1", name: "add", args: '{"a":1,"b":2}' })

		const outputs = await collect(runner.run(call))

		expect(receivedArgs).toEqual({ a: 1, b: 2 })
		expect(outputs).toHaveLength(1)
		expect(outputs[0]).toBeInstanceOf(FunctionCallOutputItem)
		expect(outputs[0].toJSON()).toEqual({
			type: "function_call_output",
			call_id: "call_1",
			output: [{ type: "input_text", text: '{"sum":3}' }],
		})
	})

	it("throws when no tool matches the call name", async () => {
		const runner = new DefaultFunctionCallRunner([makeTool("known", async () => null)])
		const call = FunctionCallItem.rehydrate({ callId: "c", name: "missing", args: "{}" })

		await expect(collect(runner.run(call))).rejects.toThrow("Unknown tool: missing")
	})

	it("selects the tool by name when several are registered", async () => {
		const runner = new DefaultFunctionCallRunner([
			makeTool("first", async () => "no"),
			makeTool("second", async () => "yes"),
		])
		const call = FunctionCallItem.rehydrate({ callId: "c", name: "second", args: "{}" })

		const outputs = await collect(runner.run(call))

		expect(outputs[0].toJSON().output).toEqual([{ type: "input_text", text: '"yes"' }])
	})
})
