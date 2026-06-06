import { ModelName } from "@app/services/model-repository";
import { InferenceParams } from "@domain/agentic-environment/inference/params";
import { EndpointRequestMapper } from "@domain/generative-model/endpoint-request-mapper";
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message";
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output";
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message";
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message";
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call";
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message";

export class GeminiGenerateContentMapper implements EndpointRequestMapper {

    mapToolCalling(inferenceParams: InferenceParams<ModelName>): unknown {
        return {
            config: {
                tools: [{
                    functionDeclarations: inferenceParams.tools?.map((tool) => {
                        return {
                            name: tool.name,
                            description: tool.description,
                            parametersJsonSchema: tool.parameters
                        }
                    })
                }]
            
            }
        }
    }

    mapReasoningEffort(inferenceParams: InferenceParams<ModelName>): unknown {
        const thinkingLevel = inferenceParams.reasoningEffort ? "minimal" : inferenceParams.reasoningEffort
        return { 
            config: {
                thinkingConfig: { 
                    thinkingLevel, 
                    includeThoughts: true 
                }
            }
        }
    }

    mapStreaming(inferenceParams: InferenceParams<ModelName>): unknown {
        return
    }

    mapStructuredOutput(inferenceParams: InferenceParams<ModelName>): unknown {
        const format = inferenceParams.structuredOutput!.schema
		return {
			config: {
				responseMimeType: "application/json",
				responseSchema: format
			}
		}
    }


    mapContextItems(inferenceParams: InferenceParams<ModelName>): { contents: any[]; systemInstruction?: string } {
        const context = inferenceParams.context
		const contents: any[] = []
		const system: string[] = []
		const callNames = new Map<string, string>()

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				system.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				this.addPart(contents, "user", { text: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				this.addPart(contents, "model", { text: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				callNames.set(item.callId, item.name)
				let args: any
				try {
					args = JSON.parse(item.args)
				} catch {
					args = {}
				}
				this.addPart(contents, "model", { functionCall: { id: item.callId, name: item.name, args } })
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				this.addPart(contents, "user", {
					functionResponse: {
						id: item.callId,
						name: callNames.get(item.callId) ?? "",
						response: this.parseResponse(item.output.text),
					},
				})
			}
		}

		return {
			contents,
			systemInstruction: system.length > 0 ? system.join("\n\n") : undefined,
		}
	}

    private addPart(contents: any[], role: "user" | "model", part: any): void {
		const last = contents[contents.length - 1]
		if (last?.role === role) {
			last.parts.push(part)
			return
		}

		contents.push({ role, parts: [part] })
	}

    private parseResponse(output: string): any {
		try {
			const parsed = JSON.parse(output)
			return parsed && typeof parsed === "object" ? parsed : { output }
		} catch {
			return { output }
		}
	}

}