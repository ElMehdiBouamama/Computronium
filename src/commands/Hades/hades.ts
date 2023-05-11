import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Pagination, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { NotBot, UserPermissions } from "@guards";
import { HadesService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction, Embed, GuildMember, User } from "discord.js";
import { Client, Guard } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'hades', description: 'Hades Star Commands' })
@SlashGroup({ name: 'admin', description: 'Admin commands for HS', root: 'hades' })
@SlashGroup({ name: 'tech', description: 'Tech commands for HS', root: 'hades' })
export default class HadesStarCommand {

    constructor(private service: HadesService) { }

    @Slash({
        description: "Link hades star compendium to computronium"
    })
    @Guard(
        UserPermissions(['Administrator']),
        NotBot
    )
    @SlashGroup('admin', 'hades')
    async setup(
        @SlashOption({
            description: "Use %apikey to get your API key",
            name: "key",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        APItoken: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!APItoken) return await simpleErrorEmbed(interaction, `Please enter a valid API Key`)

        const success = await this.service.add(interaction.guildId ?? "", APItoken)
        if (!success) return await simpleErrorEmbed(interaction, 'An error occured while adding your APIKey to the database')

        return await simpleSuccessEmbed(interaction, 'Your hades compendium data has been loaded!')
    }

    @Slash({
        description: "Get your saved tech levels"
    })
    @SlashGroup('tech', 'hades')
    async mods(
        @SlashOption({
            description: "User for whom you want to get the tech",
            name: "user",
            type: ApplicationCommandOptionType.User,
            required: false
        })
        user: GuildMember,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {

        if (!interaction.channel || !interaction.channel.isTextBased()) return await simpleErrorEmbed(interaction, "This command can only be executed in a text based channels")
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command can only run inside a discord server`)
        let targetUser = await user ?? interaction.member

        // This should be in a guard function
        const techData = await this.service.get(interaction.guildId, targetUser.id)
        if (!techData || techData.array.length == 0) return await simpleErrorEmbed(interaction, 'You have to link your hades compendium app first before proceeding, use %connect if it\'t your first time using hs compendium or %transferdata to load your data from another server')

        // Generate tech data embeds and picture from data retrieved from the hs compendium API
        let embedArr = await this.service.generateTechEmbeds(interaction, client, techData, targetUser);
        const paginationItems = embedArr.map((v, i) => ({
            embeds: [v.setFooter({ text: `Page ${i + 1}/${embedArr.length}` })]
        }));
        await new Pagination(interaction, paginationItems, {

            type: PaginationType.SelectMenu,
            placeholder: 'Select category',
            pageText: embedArr.map(page => page.data.title ?? `Undefined category`),
            showStartEnd: false
        }).send()
    }

    @Slash({
        description: "Get the techImage for the data"
    })
    @SlashGroup('tech', 'hades')
    async image(
        @SlashOption({
            description: "User for whom you want to get the tech image",
            name: "user",
            type: ApplicationCommandOptionType.User,
            required: false
        })
        user: GuildMember,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        if (!interaction.channel || !interaction.channel.isTextBased()) return await simpleErrorEmbed(interaction, "This command can only be executed in a text based channels")
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command can only run inside a discord server`)
        let targetUser = user ?? interaction.member

        // Use the helpful Attachment class structure to process the file for you
        const techData = await this.service.get(interaction.guildId ?? "undefined", targetUser.id);
        const attachment = await this.service.generateTechImage(interaction, techData, targetUser)
        await interaction.editReply({ files: [attachment] })
    }
}