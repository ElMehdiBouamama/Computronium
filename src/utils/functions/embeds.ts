import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder, ModalSubmitInteraction, StringSelectMenuInteraction } from "discord.js"

import { replyToInteraction } from "@utils/functions"
/**
 * Send a simple success embed
 * @param interaction - discord interaction
 * @param message - message to log
 */
export const simpleSuccessEmbed = async (interaction: CommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction, message: string) => {

    const embed = new EmbedBuilder()
        .setColor(Colors.Green) // GREEN
        .setTitle(`✅ Success`)
        .setDescription(`${message}`)

    await replyToInteraction(interaction, { ephemeral: true, embeds: [embed.data] })
}

/**
 * Send a simple error embed
 * @param interaction - discord interaction
 * @param message - message to log
 */
export const simpleErrorEmbed = async (interaction: CommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction, message: string) => {

    const embed = new EmbedBuilder()
        .setColor(Colors.Red) // RED
        .setTitle(`❌ Error`)
        .setDescription(`${message}`)

    await replyToInteraction(interaction, { ephemeral: true, embeds: [embed] })
}


/**
 * Send a simple question embed with two buttons
 * @param interaction - discord interaction
 * @param message - message to log
 * */

export const simpleQuestionEmbed = async (interaction: CommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction, message: string, labels: string[]) => {

    const embed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle(`:warning: Are you sure?`)
        .setDescription(message);

    const buttonsRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(labels[0])
                .setLabel(labels[0])
                .setStyle(ButtonStyle.Success),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId(labels[1])
                .setLabel(labels[1])
                .setStyle(ButtonStyle.Danger),
        );

    await replyToInteraction(interaction, { ephemeral: true, embeds: [embed], components: [buttonsRow] });
}