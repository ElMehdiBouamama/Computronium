import { ArgsOf, Client } from "discordx"

import { Discord, Guard, On } from "@decorators"
import { NotBot } from "@guards"
import { executeEvalFromMessage, isDev } from "@utils/functions"

import { generalConfig } from "@config"
import { MessageType, TextChannel } from "discord.js"
import { injectable } from "tsyringe"
import { LLM } from "../plugins/llm/services"

@injectable()
@Discord()
export default class MessageCreateEvent {

    constructor() { }

    @On("messageCreate")
    @Guard(
        NotBot
    )
    async messageCreateHandler(
        [message]: ArgsOf<"messageCreate">, 
        client: Client
     ): Promise<false | undefined> {

        // eval command
        if (
            message.content.startsWith(`\`\`\`${generalConfig.eval.name}`)
            && (
                (!generalConfig.eval.onlyOwner && isDev(message.author.id))
                || (generalConfig.eval.onlyOwner && message.author.id === generalConfig.ownerId)
            )
        ) {
            executeEvalFromMessage(message)
        }

        if (message.content.includes("@here") || message.content.includes("@everyone") || message.content.includes("〘💜Bots💜〙") || message.type == MessageType.Reply) return false;

        if (client.user && message.mentions.has(client.user.id)) {
            let answer = await LLM.exec(message.cleanContent.slice(client.user.username.length + 2));
            (message.channel as TextChannel).send(answer)
        }

        await client.executeCommand(message, {caseSensitive: false, forcePrefixCheck: false, log: true})
    }

}