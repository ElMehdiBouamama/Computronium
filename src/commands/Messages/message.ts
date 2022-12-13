import { Category } from "@discordx/utilities"
import { ApplicationCommandOptionType, CommandInteraction, TextBasedChannel, TextChannel } from "discord.js"
import { Client } from "discordx"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Guard } from "@guards"
import { simpleSuccessEmbed } from "@utils/functions"

@Discord()
@Category('Messages')
@SlashGroup({ name: 'messages', description: 'Manage messages in channels' })
@SlashGroup('messages')
export default class MessageCommand {

    @Slash({
        description: "Delete messages from the specified channel"
    })
    @Guard()
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
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {

        if (!channel) {
            channel = interaction.channel;
        }

        const msgs = await channel?.messages.fetch({ limit: count, before: interaction.id });
        if (msgs) {
            if (count < 2) {
                await msgs.forEach(x => { x.delete() });
            } else {
                (channel as TextChannel).bulkDelete(msgs);
            }
        }

        await simpleSuccessEmbed(
            interaction,
            count.toString() + ' Messages Deleted!'
        );
    }
}