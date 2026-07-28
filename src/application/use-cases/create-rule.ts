import { Condition } from "@domain/agentic-environment/participant/process/condition"
import { Action, Rule, SituationContext } from "@domain/agentic-environment/participant/process/process"

type CreateRuleParams<TInput> = {
	readonly condition: Condition
	readonly resolveInput: (context: SituationContext) => NoInfer<TInput>
	readonly action: Action<TInput>
}

export function createRule<TInput>({ condition, resolveInput, action }: CreateRuleParams<TInput>): Rule<TInput> {
	return {
		condition,
		resolveInput,
		action,
	}
}
