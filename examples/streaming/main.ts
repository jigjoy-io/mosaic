import "dotenv/config"
import { agent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { user } from "./user"

initializeRuntime({ state: new EnvironmentState() })

join(user)
join(agent)

sendMessage("Suggest me a books about circular economy", user.getId())
