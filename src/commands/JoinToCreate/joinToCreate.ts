import { Category } from "@discordx/utilities"
import { ApplicationCommandOptionType, ChannelType, CommandInteraction, VoiceBasedChannel } from "discord.js"

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
import { Guard } from "@guards"
import { JoinToCreate } from "@services"
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions"
import { Client } from "discordx"
import { injectable } from "tsyringe"

@injectable()
@Discord()
@Category('Channels & Messages')
@SlashGroup({ name: 'jointocreate', description: 'Create temporary voice channels', root: 'messages' })
@SlashGroup('jointocreate', 'messages')
export default class ChannelCommand {

    constructor(private jtcService: JoinToCreate) {
    }

    @Slash({
        description: "Make an existing channel a Join To Create channel."
    })
    async create(
        @SlashOption({
            description: "Join To Create Channel",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
        channel: VoiceBasedChannel,
        interaction: CommandInteraction
    ) {
        if (interaction.guildId && channel.type == ChannelType.GuildVoice) {
            const isAdded = await this.jtcService.addChannel(interaction.guildId, channel.id)
            if (isAdded) {
                return await simpleSuccessEmbed(interaction, `<#${channel.id}> is now a Join To Create channel!`)
            } else {
                return await simpleErrorEmbed(interaction, `<#${channel.id}> is already a Join To Create channel!`)
            }
        } else {
            return await simpleErrorEmbed(interaction, 'Channel must be a voice channel')
        }
    }

    @Slash({
        description: "Revert a Join To Create channel to normal."
    })
    @Guard()
    async delete(
        @SlashOption({
            description: "Join To Create Channel",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
        channel: VoiceBasedChannel,
        interaction: CommandInteraction
    ) {
        if (!interaction.guildId) {
            return await simpleErrorEmbed(interaction, 'This command is only available in Discord servers');
        }

        if (channel.type !== ChannelType.GuildVoice) {
            return await simpleErrorEmbed(interaction, 'Channel must be a voice channel');
        }

        const isDeleted = await this.jtcService.removeChannel(interaction.guildId, channel.id);

        if (isDeleted) {
            return await simpleSuccessEmbed(interaction, `<#${channel.id}> is now a normal channel!`);
        } else {
            return await simpleSuccessEmbed(interaction, `<#${channel.id}> is not a Join To Create channel!`);
        }
    }

    @Slash({
        description: "Revert a Join To Create channel to normal."
    })
    @Guard()
    async list(
        interaction: CommandInteraction,
        client: Client
    ) {
        if (!interaction.guildId) {
            return await simpleErrorEmbed(interaction, 'Interaction only available in discord servers');
        }

        const guildChannel = await this.jtcService.getGuildChannels(interaction.guildId);
        const channels = guildChannel.channelIds
            .filter(channelId => interaction.guild?.channels.resolve(channelId))
            .map(channelId => `<#${channelId}>`).join('\n');

        return await simpleSuccessEmbed(interaction, channels || 'No Join To Create channel found');

    }
}