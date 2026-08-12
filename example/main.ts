import { join } from "@app/use-cases/join"
import { agent } from "./agent"
import { EnvironmentState, FreemiumAccount, initializeRuntime } from "./runtime"
import { user } from "./user"
import { sendMessage } from "@app/use-cases/send-message"

const freemiumAccount = FreemiumAccount.init(3)
const config = {
	state: new EnvironmentState(freemiumAccount),
}

initializeRuntime(config)

join(user)
join(agent)

sendMessage("Hello, how are you?", user.getId())
