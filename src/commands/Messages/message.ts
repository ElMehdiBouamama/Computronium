import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Category } from "@discordx/utilities"
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions"
import { ApplicationCommandOptionType, CommandInteraction, TextBasedChannel, TextChannel } from "discord.js"

@Discord()
@Category('Messages')
@SlashGroup({ name: 'messages', description: 'Manage messages in channels' })
@SlashGroup('messages')
export default class MessageCommand {

    @Slash({
        description: "Delete messages from the specified channel"
    })
    async delete(
        @SlashOption({
            description: "number of messages to delete",
            name: "count",
            type: ApplicationCommandOptionType.Number,
            required: true
        })
        count: number,
        @SlashOption({
            description: "channel where the messages are",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | null,
        interaction: CommandInteraction
    ) {
        channel = (channel ?? interaction.channel) as TextChannel

        const msgs = await channel?.messages.fetch({ limit: count, before: interaction.id })
        if (msgs) {
            try {
                if (count < 2) {
                    await msgs.forEach(x => { x.delete() })
                } else {
                    channel.bulkDelete(msgs)

                }
            } catch (e) {
                return await simpleErrorEmbed(interaction, "Could not delete the messages!")
            }
        }

        return await simpleSuccessEmbed(
            interaction,
            count.toString() + ' Messages Deleted!'
        );
    }
}