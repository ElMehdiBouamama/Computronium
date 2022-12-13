import { CommandInteraction, ModalSubmitInteraction } from "discord.js"
import { SimpleCommandMessage } from "discordx"

/**
 * Abstraction level to reply to either a slash command or a simple command message.
 * @param interaction 
 * @param message 
 */
export const replyToInteraction = async (interaction: CommandInteraction | SimpleCommandMessage | ModalSubmitInteraction, message: string | { [key: string]: any }) => {
    
    if (interaction instanceof CommandInteraction) await interaction.followUp(message)
    else if (interaction instanceof SimpleCommandMessage) await interaction.message.reply(message)
}