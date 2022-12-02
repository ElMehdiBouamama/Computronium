import { ActionRowBuilder, ApplicationCommandOptionType, CommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextBasedChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { Client, ModalComponent } from "discordx"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Guard } from "@guards"
import { simpleSuccessEmbed } from "@utils/functions"
import { Category } from "@discordx/utilities"

@Discord()
@Category('Embeds')
@SlashGroup({ name: 'embed', description: 'Manage embeds in channels'})
@SlashGroup('embed')
export default class EmbedCommand {

    @Slash({
        description: 'Create an embed in the specified channel'
    })
    async create(
        @SlashOption({
            description: "embed to display",
            name: "embed",
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        embedString: string,
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
        if (embedString) {
            const embed = JSON.parse(embedString);
            await simpleSuccessEmbed(interaction, 'Embed created succesfully');
            await channel?.send(embed);
        }
    }
}