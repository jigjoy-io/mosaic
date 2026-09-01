import "dotenv/config"
import { agent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { user } from "./user"

initializeRuntime({ state: new EnvironmentState() })

join(user)
join(agent)

sendMessage("Give me a brief investment view on Apple.", user.getId())
