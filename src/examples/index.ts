import { OpenAIText, OpenAITools, TextGen, ToolSpec, ToolUse, OpenAIModel, Mosaic } from "@jigjoy-io/mosaic/dist/index.js"

import 'dotenv/config'

const mosaic = new Mosaic()
  .withText(new OpenAIText(OpenAIModel.GPT_5_MINI))
  .withTools(new OpenAITools(OpenAIModel.GPT_5))
  .build()

class PlannerAgent {
    
    constructor(private llm: TextGen) {}

    async plan(userMsg: string) {
        return this.llm.text([{ role: "user", content: userMsg }])
    }

}

// --- Sub-Agent exposed as a Tool -------------------------------------------
class WeatherDB {
    async run({ city }: { city: string }) {
        const db: Record<string, { tempC: number; condition: string }> = {
            "Novi Sad": { tempC: 24, condition: "Sunny" },
            "Belgrade": { tempC: 23, condition: "Partly Cloudy" }
        }
        return db[city] || { tempC: 22, condition: "Clear" }
    }
}
  
function weatherTool(db: WeatherDB): ToolSpec {
    return {
        name: "getWeather",
        schema: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
        invoke: (args: any) => db.run(args)
    }
}
  

const planner = new PlannerAgent(mosaic)

const message = "I'm planning a weekend trip. What's the weather in Novi Sad?"

const output = await planner.plan(message)
console.log("Answer →", output.text)
console.log("--------------------")
class WeatherAgent {

    constructor(private llm: ToolUse, private tools: ToolSpec[]) {}

    async execute(userMsg: string) {
        return this.llm.withTools([{ role: "user", content: userMsg }], this.tools)
    }
}

const router  = new WeatherAgent(mosaic, [weatherTool(new WeatherDB())])

const exec = await router.execute(message)
console.log("ToolCalls →", exec.toolCalls)
console.log("Answer →", exec.text)