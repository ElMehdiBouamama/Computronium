import { Discord, Ephemeral, Guard, Slash, SlashGroup } from "@decorators";
import { Pagination, PaginationItem, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { Disabled, GuildOnly, NotBot } from "@guards";
import { CompendiumService, ProfileService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ActionRowBuilder, CommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuInteraction } from "discord.js";
import { Client, SelectMenuComponent } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'rsmods', description: 'Manage your Red Star modules', root: 'hades' })
@SlashGroup('rsmods', 'hades')
export default class RSModsCommand {

    private pagination: Pagination;

    constructor(private compendiumService: CompendiumService, private profileService: ProfileService) { }

    @Ephemeral()
    @Slash({
        name: 'add',
        description: "Select the modules you want to add to the list of modules you will be using in red stars"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async add(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        interaction.deferReply({ ephemeral: true })
        if (!interaction.member || !interaction.guildId) return;

        const userProfile = await this.profileService.getMemberProfile(interaction.member.user.id)
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        const techData = await this.compendiumService.get(interaction.guildId, interaction.member.user.id)
        const isValid = await this.compendiumService.validate(techData, interaction)

        if (isValid && userProfile) {
            // Generate tech data embeds data retrieved from the hs compendium API
            let pages = await this.compendiumService.generateTechSelectMenu(interaction, client, techData.array)

            let embed = this.profileService.generateRSModsEmbed(client, userProfile.rsMods);

            const paginationItems = pages.map<PaginationItem>(page => ({
                embeds: [embed],
                components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(page.menuItem)]
            }))

            this.pagination = new Pagination(
                interaction,
                paginationItems,
                {
                    type: PaginationType.Button,
                    ephemeral: true,
                    showStartEnd: false
                })
            this.pagination.send()
        }
        return;
    }

    @Ephemeral()
    @Slash({
        name: 'remove',
        description: "Select the modules you want to remove from the list of modules you will be using in red stars"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async remove(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        interaction.deferReply({ ephemeral: true })
        if (!interaction.member || !interaction.guildId) return;

        const userProfile = await this.profileService.getMemberProfile(interaction.member.user.id)
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        const techData = await this.compendiumService.get(interaction.guildId, interaction.member.user.id)
        const isValid = await this.compendiumService.validate(techData, interaction)

        if (isValid && userProfile) {
            // Generate tech data embeds data retrieved from the hs compendium API
            let pages = await this.compendiumService.generateTechSelectMenu(interaction, client, techData.array, 'remove')

            let embed = this.profileService.generateRSModsEmbed(client, userProfile.rsMods);

            const paginationItems = pages.map<PaginationItem>(page => ({
                embeds: [embed],
                components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(page.menuItem)]
            }))

            this.pagination = new Pagination(
                interaction,
                paginationItems,
                {
                    type: PaginationType.Button,
                    ephemeral: true,
                    showStartEnd: false
                })
            this.pagination.send()
        }
        return;
    }

    @Slash({
        name: 'clear',
        description: "Resets your saved RS Modules"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async clear(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        //interaction.deferReply({ ephemeral: true })
        if (!interaction.member || !interaction.guildId) return;

        const userProfile = await this.profileService.getMemberProfile(interaction.member.user.id)
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        const rsMods = await this.profileService.addUserRSMods(userProfile.starId, null)
        if (!rsMods) return await simpleErrorEmbed(interaction, "An error occured while reseting your rs data")

        return await simpleSuccessEmbed(interaction, "Your red star modules data has been cleared succesfully!");
    }

    @Slash({
        name: 'get',
        description: "Get your saved RS Modules"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async get(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!interaction.member || !interaction.guildId) return;

        const userProfile = await this.profileService.getMemberProfile(interaction.member.user.id)
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        let embed = this.profileService.generateRSModsEmbed(client, userProfile.rsMods)
        interaction.editReply({ embeds: [embed] })
        return;
    }

    @SelectMenuComponent({ id: "add-rsmodules-menu" })
    async handleAdd(interaction: StringSelectMenuInteraction): Promise<unknown> {
        const userProfile = await this.profileService.getMemberProfile(interaction.member?.user.id ?? "")
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        const rsMods = await this.profileService.addUserRSMods(userProfile.starId, interaction.values)
        if (!rsMods) return await simpleErrorEmbed(interaction, "An error occured while saving your data")

        let embed = this.profileService.generateRSModsEmbed(interaction.client as Client, rsMods);

        (this.pagination.pages as PaginationItem[]).forEach(item => item.embeds = [embed])

        console.log()

        return await interaction.update({ embeds: [embed] });
    }

    @SelectMenuComponent({ id: "remove-rsmodules-menu" })
    async handleRemove(interaction: StringSelectMenuInteraction): Promise<unknown> {
        const userProfile = await this.profileService.getMemberProfile(interaction.member?.user.id ?? "")
        if (!userProfile) return await simpleErrorEmbed(interaction, "You don't have a profile yet. Use /hades profile set to setup your in game profile first.")

        const rsMods = await this.profileService.removeUserRSMods(userProfile.starId, interaction.values)
        if (!rsMods) return await simpleErrorEmbed(interaction, "An error occured while saving your data")

        let embed = this.profileService.generateRSModsEmbed(interaction.client as Client, rsMods);

        (this.pagination.pages as PaginationItem[]).forEach(item => item.embeds = [embed])

        return await interaction.update({ embeds: [embed] });
    }
}