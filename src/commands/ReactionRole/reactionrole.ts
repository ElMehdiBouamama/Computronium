﻿import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { ReactionRoleService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, Collection, Colors, CommandInteraction, EmbedBuilder, Message, Role, TextBasedChannel } from "discord.js";
import { Client } from "discordx";
import { injectable } from "tsyringe";
import { BaseReactionRole } from "../../utils/classes";

@Discord()
@injectable()
@Category('Reaction Role')
@SlashGroup({ name: 'reactionrole', description: 'Manage reaction roles of messages' })
@SlashGroup('reactionrole')
export default class ReactionRoleCommand {

    constructor(private service: ReactionRoleService) { }

    @Slash({
        description: "Create a reaction role"
    })
    async create(
        @SlashOption({
            description: "The message id of the reaction role message.",
            name: "message_id",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        messageId: string,
        @SlashOption({
            description: "The reaction role emoji.",
            name: "emoji",
            type: ApplicationCommandOptionType.String,
            required: true,
        })
        strEmoji: string,
        @SlashOption({
            description: "The reaction role role.",
            name: "role",
            type: ApplicationCommandOptionType.Role,
            required: true,
        })
        role: Role,
        @SlashOption({
            description: "The channel of the reaction role message.",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | null,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {

        channel = channel ?? interaction.channel
        const message = await channel?.messages
            .fetch(messageId)
            .catch(async e => await simpleErrorEmbed(interaction, `Could not find the message ${messageId} in ${channel?.id}`))
            .then(async message => {
                // Verify that the specified emoji exists
                const emoji = await client.emojis.resolveIdentifier(strEmoji)
                if (emoji && interaction.guildId && channel?.id) {
                    // React with to the message with the emoji if the emoji exists
                    await message?.react(emoji)
                    // Register the emoji, role, messageId in the db
                    this.service.add(interaction.guildId, channel?.id, (message as Message<true>)?.id, emoji, role.id)
                    await simpleSuccessEmbed(interaction, `Reaction role created`)
                } else if (!emoji) {
                    await simpleErrorEmbed(interaction, `The emoji is not valid.`)
                } else {
                    await simpleErrorEmbed(interaction, `You can only create reaction roles in discord servers.`)
                }
            })
    }

    @Slash({
        description: "Get the list of all reaction roles"
    })
    async list(
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        let reactionRoles: BaseReactionRole
        if (interaction.guildId) {
            reactionRoles = await this.service.get(interaction.guildId)

            let embed = new EmbedBuilder()
                .setTitle(`Reaction roles list by channel`)
                .setColor(Colors.Green)

            if (reactionRoles) {
                reactionRoles.channels.forEach((channel, channelId) => embed.addFields(
                    {
                        name: interaction.guild?.channels.cache.get(channelId)?.name ?? channelId,
                        value:
                            [...channel.keys()].map(k => `https://discordapp.com/channels/${interaction.guildId}/${channelId}/${k}\n` +
                                `${reactionRoles.channels?.get(channelId)?.get(k)?.map(
                                    (role, emoji) => `${decodeURIComponent(emoji).includes(':') ? `<:${decodeURIComponent(emoji)}>` : decodeURIComponent(emoji)}  => <@&${role}>`).join("\n")}`)
                                .join('\n\n'),
                        inline: true
                    }))
            }
            interaction.followUp({ content: '', embeds: [embed] })
        }
    }


    @Slash({
        description: "Remove a registered reaction role"
    })
    async remove(
        @SlashOption({
            description: "The message id of the reaction role message.",
            name: "message_id",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        messageId: string,
        @SlashOption({
            description: "The reaction role emoji.",
            name: "emoji",
            type: ApplicationCommandOptionType.String,
            required: false,
        })
        strEmoji: string,
        @SlashOption({
            description: "The channel of the reaction role message.",
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        })
        channel: TextBasedChannel | null,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        channel = channel ?? interaction.channel
        if (interaction.guildId && channel) {
            if (strEmoji) {
                const emoji = await client.emojis.resolveIdentifier(strEmoji)
                if (emoji && channel.id) {
                    const success = await this.service.deleteEmoji(interaction.guildId, channel.id, messageId, emoji)
                    if (success) {
                        await simpleSuccessEmbed(interaction, `Deleted emoji: ${emoji} from message:${messageId}`)
                    }
                    else {
                        await simpleErrorEmbed(interaction, `Could not delete ${emoji} from message ${messageId}`)
                    }
                }
            } else {
                const success = await this.service.deleteMessage(interaction.guildId, messageId)
                if (success) {
                    await simpleSuccessEmbed(interaction, `Deleted message: ${messageId}`)
                } else {
                    await simpleErrorEmbed(interaction, `Could not delete message: ${messageId}`)
                }
            }
        }
    }

    @Slash({
        description: "Clear all the reaction roles from this guildId database"
    })
    async clear(
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        if (interaction.guildId) {
            this.service.clear(interaction.guildId)
            await simpleSuccessEmbed(interaction, `All the reaction roles for this guild has been cleared!`)
        } else {
            await simpleErrorEmbed(interaction, 'Interactions must take place in a guild')
        }
    }
}