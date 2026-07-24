import { SemanticEvent } from "@domain/model-context/semantic-event/semantic-event"
import { Action } from "../behavior/action"
import { ModelContext } from "@domain/model-context/model-context"
import { Situation } from "../behavior/situation"

export class Memory {
	private readonly context: ModelContext
	private constructor(context: ModelContext) {
		this.context = context
	}

	getContext(): ModelContext {
		return this.context
	}

	static create(): Memory {
		const context = ModelContext.create()
		return new Memory(context)
	}
}

export interface SituationMapper<ActionParameters> {
	map(situation: Situation): ActionParameters
}

export interface SituationProcessor {
	process(situation: Situation): AsyncIterable<SemanticEvent>
}

export class SituationProcessing<ActionParameters> implements SituationProcessor {
	constructor(
		private readonly situationMapper: SituationMapper<ActionParameters>,
		private readonly action: Action<ActionParameters>,
	) {}

	async *process(situation: Situation): AsyncIterable<SemanticEvent> {
		const params = this.situationMapper.map(situation)
		const result = this.action.execute(params)

		yield* result
	}
}

export type FunctionCallParams = {
	signal?: AbortSignal
}
