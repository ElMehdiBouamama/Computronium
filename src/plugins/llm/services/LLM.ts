import { singleton } from 'tsyringe'
import { OpenAI } from "langchain";

@singleton()
export class LLM {
    private model: OpenAI;
    private openai_key: string;
    private serapi_key: string;

    constructor() {
        this.openai_key = process.env["OPENAI_API_KEY"] as string
        this.serapi_key = process.env["SERPAPI_API_KEY"] as string
        this.model = new OpenAI({ openAIApiKey: this.openai_key, temperature: 0.9 });
    }

    public async process(message: string): Promise<string> {
        const res = await this.model.call(
            message
        );
        return res
    }
}