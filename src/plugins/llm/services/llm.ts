import { HuggingFaceInference } from "langchain/llms/hf";
import { singleton } from "tsyringe"

@singleton()
export class LLM {

    private static model: HuggingFaceInference;

    constructor() {
        LLM.model = new HuggingFaceInference({
            model: "gpt2",
            apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
        });
    }


    static async exec(query: string) {
        const res = await this.model.call(query)
        return res
    }
}