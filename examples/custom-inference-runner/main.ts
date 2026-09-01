import { agent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { MockInferenceRunner } from "./runner"
import { user } from "./user"
import { OpenAIChatCompletions } from "@infra/providers/openai/endpoints/openai-chat-completions"

initializeRuntime({
	state: new EnvironmentState(),
	inferenceRunnerConfig: {
		supportedModels: [
			{
				endpoint: new OpenAIChatCompletions(),
				specification: {
					name: "grok",
					provider: "openai",
					supportsReasoningEffort: false,
					supportedReasoningEfforts: [],
					supportsStreaming: false,
					contextWindowSize: 100000,
					supportedContextItemTypes: [],
					maxOutputTokens: 100000,
					supportsFunctionCalling: false,
					supportsStructuredOutput: false,
				},
			},
		],
		runner: new MockInferenceRunner(),
	},
})

join(user)
join(agent)

sendMessage("What is a stock split?", user.getId())
