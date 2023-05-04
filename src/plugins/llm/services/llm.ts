import { OpenAI } from "langchain/llms/openai";
import { singleton } from "tsyringe"

@singleton()
export class LLM {

    private static model: OpenAI;

    constructor() {
        LLM.model = new OpenAI({ openAIApiKey: "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", temperature: 0.9 });
    }

    static async exec(query: string) {
        console.log("LLM Execution: Started")
        let res = ''
        try {
            res = await this.model.call(
                "What would be a good company name a company that makes colorful socks?"
            )
        } catch (e: any) {
            res = e.error;
        }
        return res
    }
}