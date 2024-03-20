import { CallbackManagerForLLMRun } from "langchain/dist/callbacks/manager";
import { LLMResult } from "langchain/dist/schema";
import { LLM } from "langchain/llms/base";

/**
 * Wrapper around tloen/alpaca-lora-7b large language model that uses the chat endpoint.
 * @augments BaseLLM
 */
export class OpenLlamaChat extends LLM {
    async _call(prompt: string, stop?: string[] | this["CallOptions"] | undefined, runManager?: CallbackManagerForLLMRun | undefined): Promise<string> {
        const instruction = `You are Computronium, a Discord bot in charge of assisting users on the multiple discord server, the main discord server is called "Trisolaris" but you are going to be used in different servers. Your role is to provide helpful and respectful support to community members, without sending them to server staff for more informations. Here are your instructions:
        Greet users warmly: When users join the server or interact with you directly, greet them with a warm and friendly message.
        Use polite and respectful language: Ensure that all your responses are crafted using polite and respectful language. Avoid offensive or disrespectful terms and always maintain a courteous tone in your interactions.
        Provide accurate and helpful information: Your primary goal is to assist users effectively. Provide accurate information and helpful solutions to their inquiries or problems. If you're unsure about something, it's better to let them know and offer assistance in finding the correct information.
        Offer guidance and resources: When assisting users, go beyond simple answers. Provide guidance, suggestions, and resources that can help them further. Point them to relevant documentation, tutorials, or resources.
        Remember, Computronium, as a respectful Discord bot, you play a crucial role in fostering a positive and inclusive environment on the Trisolaris server. Your assistance and respectful interactions contribute to the overall well-being of the community.`

        const response = await fetch("https://tloen-alpaca-lora.hf.space/run/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [
                    instruction,
                    prompt,
                    this.configs.temperature,
                    this.configs.topP,
                    this.configs.topK,
                    this.configs.beams,
                    this.configs.maxTokens
                ]
            })
        });
        const data = await response.json() as llamaAPIResult;
        return data.data[0]
    }

    async call(prompt: string): Promise<string> {
        return await this._call(prompt)
    }

    async _generate(prompts: string[], stop?: this["CallOptions"] | string[] | undefined, runManager?: CallbackManagerForLLMRun | undefined): Promise<LLMResult> {
        const response = await fetch("https://tloen-alpaca-lora.hf.space/run/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [
                    prompts[0],
                    "",
                    this.configs.temperature,
                    this.configs.topP,
                    this.configs.topK,
                    this.configs.beams,
                    this.configs.maxTokens
                ]
            })
        });

        const data = await response.json();
        return data.data;
    }

    _llmType(): string {
        return "alpaca-lora-7b";
    }

    configs = {
        temperature: 0.1,
        topP: 0.75,
        topK: 40,
        beams: 4,
        maxTokens: 512,
        modelName: "LLMs/AlpacaGPT4-LoRA-7B-OpenLLaMA"
    }

    constructor(private instruction?: string) {
        super({})
    }
}

export interface ConfigurationParameters {
    modelName: string;
    temperature: number;
    topP: number;
    topK: number;
    beams: number;
    maxTokens?: number;
}

export interface llamaAPIResult {
    data: string[];
    is_generating: boolean;
    duration: number;
    average_duration: number;
}