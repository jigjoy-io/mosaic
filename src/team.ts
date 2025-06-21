import { Contributor } from "./contributor"

export class Team {

    private static contributors: Map<string, Contributor> = new Map()

    static addContributor(contributor: Contributor) {
		this.contributors.set(contributor.name, contributor)
    }

    static getContributor(name: string): Contributor {
		const contributor = this.contributors.get(name)
		if (!contributor) {
			throw new Error(`Contributor "${name}" is not found.`)
		}
		return contributor
    }
}