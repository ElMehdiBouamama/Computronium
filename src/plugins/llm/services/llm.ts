import { ConversationChain } from "langchain/chains";
import { ChatGooglePaLM } from "langchain/chat_models/googlepalm";
import { GooglePaLMEmbeddings } from "langchain/embeddings/googlepalm";
import { BufferMemory, VectorStoreRetrieverMemory } from "langchain/memory";
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "langchain/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { singleton } from "tsyringe";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '../.env' });


@singleton()
export class computroniumLLM {

    private static llm = new ChatGooglePaLM({ apiKey: process.env.GOOGLE_PALM_API_KEY });
    private static memory = new VectorStoreRetrieverMemory({
        vectorStoreRetriever: new MemoryVectorStore(new GooglePaLMEmbeddings({ apiKey: process.env.GOOGLE_PALM_API_KEY })).asRetriever(1),
        memoryKey: "history",
    });


    private static prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate("The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."),
        new MessagesPlaceholder("history"),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
    private static chain = new ConversationChain({
        //memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
        memory: computroniumLLM.memory,
        prompt: computroniumLLM.prompt,
        llm: computroniumLLM.llm,
        verbose: false
    });


    // Model Inference
    static async exec(query: string): Promise<string> {
        const res = await this.chain.call({ input: query });
        return res.response;
    }
}