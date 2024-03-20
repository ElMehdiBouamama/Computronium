import { Discord, Ephemeral, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextBasedChannel,
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import { ModalComponent } from "discordx";

@Discord()
@Category('Channels & Messages')
@SlashGroup({ name: 'embed', description: 'Manage embeds in channels', root: 'messages' })
@SlashGroup('embed', 'messages')
export default class EmbedCommand {
    channel: TextBasedChannel | null;

    @Ephemeral()
    @Slash({
        name: 'create',
        description: 'Create an embed in the specified channel'
    })
    async create(
        @SlashOption({
            description: "channel where the messages are",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | null,
        interaction: CommandInteraction
    ) {
        if (!channel) {
            this.channel = interaction.channel;
        }
        const modal = new ModalBuilder()
            .setCustomId('EmbedForm')
            .setTitle('Create your embeds')
        const embedInput = new TextInputBuilder()
            .setCustomId('embedField')
            .setLabel("Paste your embed here")
            .setStyle(TextInputStyle.Paragraph)
        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(embedInput)
        modal.addComponents(firstActionRow)
        await interaction.showModal(modal)
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
                await (this.channel as TextChannel).send(embed);
                embed = new EmbedBuilder()
                    .setColor(Colors.Green) // GREEN // see: https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Colors.js
                    .setTitle(`✅ Embed created succesfully`);
                await interaction.reply({
                    embeds: [embed]
                });
            } catch (e) {
                embed = new EmbedBuilder()
                    .setColor(Colors.Red) // RED // see: https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Colors.js
                    .setTitle(`❌ The embed is incorrect!`)
                    .setDescription(`Please use this [embed builder](https://glitchii.github.io/embedbuilder/)`)

                await interaction.reply({
                    embeds: [embed]
                });
            }
        }
        return;
    }
}