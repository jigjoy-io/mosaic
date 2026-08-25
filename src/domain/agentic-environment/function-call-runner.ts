import type { FunctionCallParams } from "@app/services/function-call"
import { FunctionCallOutputParams } from "@app/services/function-call"

export interface FunctionCallRunner {
	run(input: FunctionCallParams): Promise<FunctionCallOutputParams>
}
