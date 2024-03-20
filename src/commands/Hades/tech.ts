import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Pagination, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { Disabled, GuildOnly, NotBot, TextChannelOnly } from "@guards";
import { CompendiumService } from "@services";
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from "discord.js";
import { Client, Guard } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'tech', description: 'Tech commands for HS', root: 'hades' })
@SlashGroup('tech', 'hades')
export default class TechCommand {

    constructor(private service: CompendiumService) { }

    @Slash({
        name: 'mods',
        description: "Retrieve the tech levels from the hs compendium bot"
    })
    @Guard(NotBot, GuildOnly, TextChannelOnly, Disabled)
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
        if (!interaction.guildId) return;
        let targetUser = await user ?? interaction.member

        const techData = await this.service.get(interaction.guildId, targetUser.id)
        const isValid = await this.service.validate(techData, interaction)

        if (isValid) {
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
    }

    @Slash({
        name: 'image',
        description: "Retrieve the tech image from the hs compendium bot"
    })
    @Guard(NotBot, GuildOnly, TextChannelOnly, Disabled)
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
        if (!interaction.guildId) return;
        let targetUser = user ?? interaction.member

        const techData = await this.service.get(interaction.guildId, targetUser.id);
        const isValid = await this.service.validate(techData, interaction)

        if (isValid) {
            const attachment = await this.service.generateTechImage(interaction, techData, targetUser)
            await interaction.editReply({ files: [attachment] })
        }
    }
}