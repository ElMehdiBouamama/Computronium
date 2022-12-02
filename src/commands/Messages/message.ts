import { Category } from "@discordx/utilities"
import { ApplicationCommandOptionType, CommandInteraction, TextBasedChannel } from "discord.js"
import { Client } from "discordx"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Guard } from "@guards"
import { simpleSuccessEmbed } from "@utils/functions"

@Discord()
@Category('Messages')
@SlashGroup({ name: 'message', description: 'Manage messages in channels' })
@SlashGroup('message')
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
            await msgs.forEach(x => { x.delete() });
        }

        await simpleSuccessEmbed(
            interaction,
            count.toString() + ' Messages Deleted!'
        );
    }
}