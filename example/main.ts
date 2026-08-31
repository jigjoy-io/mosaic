import "dotenv/config"
import { agent } from "./agent"
import { EnvironmentState, FreemiumAccount, initializeRuntime, join, sendMessage } from "./runtime"
import { user } from "./user"

const freemiumAccount = FreemiumAccount.init(3)
const config = {
	state: new EnvironmentState(freemiumAccount),
}

initializeRuntime(config)

join(user)
join(agent)

sendMessage("Can you tell me more about yourself?", user.getId())
