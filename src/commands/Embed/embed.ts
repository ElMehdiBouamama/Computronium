import { ActionRowBuilder, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextBasedChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { Client, ModalComponent } from "discordx"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Category } from "@discordx/utilities"
import { simpleSuccessEmbed } from "@utils/functions"

@Discord()
@Category('Embeds')
@SlashGroup({ name: 'embed', description: 'Manage embeds in channels' })
@SlashGroup('embed')
export default class EmbedCommand {

    channel: TextBasedChannel | null;

    @Slash({
        description: 'Create an embed in the specified channel'
    })
    async create(
        //@SlashOption({
        //    description: "embed to display",
        //    name: "embed",
        //    type: ApplicationCommandOptionType.String,
        //    required: true,
        //})
        //embedString: string,
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
            this.channel = interaction.channel;
        }

        const modal = new ModalBuilder()
            .setCustomId('EmbedForm')
            .setTitle('Create your embeds');

        // Add components to modal

        // Create the text input components
        const embedInput = new TextInputBuilder()
            .setCustomId('embedField')
            // The label is the prompt the user sees for this input
            .setLabel("Paste your embed here")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Paragraph);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(embedInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);


    }

    @ModalComponent()
    async EmbedForm(interaction: ModalSubmitInteraction): Promise<void> {
        const [embedString] = ["embedField"].map((id) =>
            interaction.fields.getTextInputValue(id)
        );

        if (embedString && this.channel) {
            let embed: any;
            try {
                embed = JSON.parse(embedString)
                await this.channel.send(embed);
                embed = new EmbedBuilder()
                    .setColor(0x57f287) // GREEN // see: https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Colors.js
                    .setTitle(`✅ Embed created succesfully`);
                await interaction.reply({
                    embeds: [embed]
                });
            } catch (e) {
                embed = new EmbedBuilder()
                    .setColor(0xed4245) // RED // see: https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Colors.js
                    .setTitle(`❌ The embed is incorrect!`)
                    .setDescription(`Please use this [embed builder](https://glitchii.github.io/embedbuilder/)`)

                console.log(e);
                
                await interaction.reply({
                    embeds: [embed]
                });
            }
        }

        return;
    }
}