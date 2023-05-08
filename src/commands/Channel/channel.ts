import { Category } from "@discordx/utilities"
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder, TextBasedChannel, TextChannel } from "discord.js"
import { ButtonComponent } from "discordx"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { simpleQuestionEmbed, simpleSuccessEmbed } from "@utils/functions"

@Discord()
@Category('Channels & Messages')
@SlashGroup({ name: 'channel', description: 'Manage channels' })
@SlashGroup('channel')
export default class ChannelCommand {

    constructor() {
    }

    private channel: TextChannel;

    @Slash({
        description: "Clear all messages from the specified channel"
    })
    async clear(
        @SlashOption({
            description: "channel to clear",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | TextChannel | null,
        interaction: CommandInteraction
    ) {
        this.channel = channel ? (channel as TextChannel) : (interaction.channel as TextChannel)
        await simpleQuestionEmbed(interaction, `This will delete and re-create <#${this.channel.id}> to remove all messages inside of it.`, ["Clear Channel", "Cancel"])
    }

    @ButtonComponent({ id: "Clear Channel" })
    async handler(): Promise<void> {
        const newChannel = await this.channel.clone()
        const embed = new EmbedBuilder()
            .setColor(Colors.Green) // GREEN
            .setTitle(`:white_check_mark: All messages in this channel have been cleared!`)
        await newChannel.send({ embeds: [embed] })
        await this.channel.delete('Clearing channel')
    }

    @Slash({
        description: "Lock a specified channel"
    })
    async lock(
        @SlashOption({
            description: "channel to lock",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | TextChannel | null,
        interaction: CommandInteraction
    ) {
        const selectedChannel = channel ? (channel as TextChannel) : (interaction.channel as TextChannel)
        await selectedChannel.permissionOverwrites.edit(selectedChannel.guild.roles.everyone, {
            SendMessages: false
        })
        await simpleSuccessEmbed(interaction, "🔒 Channel locked!")
    }

    @Slash({
        description: "Unlock a specified channel"
    })
    async unlock(
        @SlashOption({
            description: "channel to unlock",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | TextChannel | null,
        interaction: CommandInteraction
    ) {
        const selectedChannel = channel ? (channel as TextChannel) : (interaction.channel as TextChannel)
        await selectedChannel.permissionOverwrites.edit(selectedChannel.guild.roles.everyone, {
            SendMessages: null
        })
        await simpleSuccessEmbed(interaction, "🔓 Channel unlocked!")
    }


}