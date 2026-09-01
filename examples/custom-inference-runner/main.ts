import { agent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { MockInferenceRunner } from "./runner"
import { user } from "./user"

initializeRuntime({
	state: new EnvironmentState(),
	inferenceRunnerConfig: {
		runner: new MockInferenceRunner(),
	},
})

join(user)
join(agent)

sendMessage("What is a stock split?", user.getId())
