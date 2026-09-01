import "dotenv/config"
import { agent } from "./agent"
import { EnvironmentState, initializeRuntime, join, sendMessage } from "./runtime"
import { user } from "./user"

initializeRuntime({ state: new EnvironmentState() })

join(user)
join(agent)

sendMessage(
	"A company has $2M in cash, $8M in debt at 6% interest, and $12M in annual free cash flow. Shares trade at 15x FCF. Should it pay down debt or repurchase shares? Walk through the trade-offs.",
	user.getId(),
)
