import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Pagination } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { NotBot, UserPermissions } from "@guards";
import { HadesService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, BaseMessageOptions, CommandInteraction, Embed } from "discord.js";
import { Client, Guard } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'hades', description: 'Hades Star Commands' })
@SlashGroup('hades')
export default class HadesStarCommand {

    constructor(private service: HadesService) { }

    @Slash({
        description: "Link hades star compendium to computronium"
    })
    @Guard(
        UserPermissions(['Administrator']),
        NotBot
    )
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
    async tech(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {

        if (!interaction.channel || !interaction.channel.isTextBased()) return await simpleErrorEmbed(interaction, "This command can only be executed in a text based channels")
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command can only run inside a discord server`)

        // This should be in a guard function
        const techData = await this.service.get(interaction.guildId, interaction.user.id)
        if (!techData || techData.array.length == 0) return await simpleErrorEmbed(interaction, 'You have to link your hades compendium app first before proceeding, use %transferdata to link load your data')

        // Generate tech data aembeds from data retrieved from the hs compendium API
        let embedArr = await this.service.generateTechEmbeds(techData, client, interaction);
        let paginationItems = embedArr.map((v, i, arr) => { return { embeds: [v.setFooter({ text: `Page ${(i + 1).toString()}/${embedArr.length}`})] } })

        await new Pagination(interaction, paginationItems).send()
    }
}