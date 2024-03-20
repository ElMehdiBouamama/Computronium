import { CommandInteraction } from "discord.js"
import { GuardFunction, SimpleCommandMessage } from "discordx"

import { getLocaleFromInteraction, L } from "@i18n"
import { replyToInteraction } from "@utils/functions"

/**
 * Prevent the command from running on DM
 */
export const TextChannelOnly: GuardFunction<
    | CommandInteraction
    | SimpleCommandMessage
> = async (arg, client, next) => {

    const isTextChannel = arg instanceof CommandInteraction ? arg.channel?.isTextBased() : false

    if (isTextChannel) return next()
    else {
        if (arg instanceof CommandInteraction) await replyToInteraction(arg, `This command can only be used in a text channel.`)
    }
}
