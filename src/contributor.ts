import OpenAI from "openai/index"
import { z } from "zod"
import { Team } from "./team"
import { zodResponseFormat } from "openai/helpers/zod"

export enum Brain {
    GPT_41 = "gpt-4.1",
    GPT_41_MINI = "gpt-4.1-mini",
    GPT_41_NANO = "gpt-4.1-nano"
}

export abstract class Contributor {

    /**
     * The name of the contributor
     */
    abstract name: string

    
    /**
     * The AI model to use
     */
    abstract brain: Brain


    /**
     * The object definition we expect the AI to return
     */
    abstract thoughtShape: z.ZodSchema



    /**
     * The function to call before the AI has thought. It's useful to supplying data for the context since it's happens before the context is set.
     */
    async preThought(input: any): Promise<void> {
        return
    }


    /**
    * The function to call to set the context of the AI
    */
    abstract loadContext(): string


    /**
     * The function to call to trigger whole process
     * @param task T
     * @returns The response of the afterThought function
     */
    async execute(task: any): Promise<any> {
        await this.preThought(task)
    
        const client = new OpenAI();
    
    
        const completion = await client.chat.completions.parse({
            model: this.brain,
            messages: [
                { role: "system", content: this.loadContext() },
                { role: "user", content: task.toString() }
            ],
            response_format: zodResponseFormat(this.thoughtShape, "thoughtShape")
        })
    
    
        return await this.afterThought(completion.choices[0].message.parsed)
    }
    
    
    /**
     * Delegate task to another collaborator
     */
    protected async delegateTo(contributorName: string, input: any): Promise<any> {

        try {
            const contributor = Team.getContributor(contributorName)
            if (!contributor) throw new Error(`Contributor "${contributorName}" is not registered.`)

            return await contributor.execute(input)
        } catch (error) {
            console.error(`Error delegating to contributor "${contributorName}":`, error)
            throw error
        }
    }


    /**
     * The function to call after the AI has thought
     */
    async afterThought(tought: z.infer<typeof this.thoughtShape>): Promise<any> {
        return tought
    }

    
}