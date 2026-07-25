import { FunctionCallRunner } from "@app/services/function-call-runner"
const functionCallRunner = new FunctionCallRunner()
export function resolveFunctionCallRunner(): FunctionCallRunner {
	return functionCallRunner
}
