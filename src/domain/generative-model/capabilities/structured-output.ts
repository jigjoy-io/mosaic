export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export interface StructuredOutputCapability {
	setStructuredOutput(format: StructuredOutputFormat | undefined): void
	getStructuredOutput(): StructuredOutputFormat | undefined
	hasStructuredOutput(): boolean
}
