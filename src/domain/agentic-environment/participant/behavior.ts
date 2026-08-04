import { Situation } from "./situation"

export class Behavior {
	constructor(
		private readonly id: string,
		private readonly name: string,
		private situations: Situation<unknown>[],
	) {}

	getSituations(): Situation<unknown>[] {
		return this.situations
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name
	}

	static create({ name, situations }: { name: string; situations: Situation<unknown>[] }): Behavior {
		const id = crypto.randomUUID()
		return new Behavior(id, name, situations)
	}
}
