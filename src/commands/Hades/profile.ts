import { Discord, Guard, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { Disabled, GuildOnly, NotBot } from "@guards";
import { ProfileService } from "@services";
import { StarId } from "@utils/classes";
import { simpleErrorEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Client } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'profile', description: 'Manage your HS profile data', root: 'hades' })
@SlashGroup('profile', 'hades')
export default class ProfileCommand {

    constructor(private service: ProfileService) { }

    @Slash({
        name: 'set',
        description: "Setup your hades star profile"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async set(
        @SlashOption({
            description: "The player in game name",
            name: "ign",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        ign: string,
        @SlashOption({
            description: "The player star id example: SVA-8779",
            name: "star_id",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        starId: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!interaction.member) return; // Already processed by the guard
        if (!StarId.isValid(starId)) return await simpleErrorEmbed(interaction, '**Invalid Star ID** please enter the starID in the following format: **SVA-8779**')
        const success = await this.service.setMemberProfile(interaction.member.user.id, ign, new StarId(starId))
        if (!success) return await simpleErrorEmbed(interaction, 'An error occured while saving the data, please try again!')

        const targetUserId = interaction.member.user.id
        const memberHSProfile = await this.service.getMemberProfile(targetUserId)
        const displayName = interaction.guild?.members.cache.find(x => x.id === targetUserId)?.displayName
        if (!memberHSProfile || !displayName) return await simpleErrorEmbed(interaction,
            `No in game profile found for **${displayName}**!\n
            If you are **${displayName}**, then you can use **/hades profile setup** to setup your in game profile!`)
        const embed = this.service.generateProfileEmbed(memberHSProfile, displayName)
        await interaction.followUp({ embeds: [embed] })
    }

    @Slash({
        name: 'get',
        description: "Get your or someone else's in game profile"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async get(
        @SlashOption({
            description: "The in game star id",
            name: "star_id",
            type: ApplicationCommandOptionType.String,
            required: false
        })
        starId: string,
        @SlashOption({
            description: "The discord user",
            name: "user",
            type: ApplicationCommandOptionType.User,
            required: false
        })
        member: AllGuildMemberTypes,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!interaction.member) return; // Already processed by the guard
        let targetUserId: string;
        if (starId) {
            if (!StarId.isValid(starId)) return await simpleErrorEmbed(interaction, '**Invalid Star ID** please enter the starID in the following format: **SVA-8779**')
            const user = await this.service.findUserByStarId(new StarId(starId))
            if (!user) return await simpleErrorEmbed(interaction, `**User not found** using the provided starId, please register the user by using **/hades profile set**`)
            targetUserId = user.userId
        }
        else if (member) {
            targetUserId = member.user.id
        } else {
            targetUserId = interaction.user.id
        }
        const memberHSProfile = await this.service.getMemberProfile(targetUserId)
        const displayName = interaction.guild?.members.cache.find(x => x.id === targetUserId)?.displayName
        if (!memberHSProfile || !displayName) return await simpleErrorEmbed(interaction,
            `No in game profile found for **${displayName}**!\n
            If you are **${displayName}**, then you can use **/hades profile set** to setup your in game profile!`)
        const embed = this.service.generateProfileEmbed(memberHSProfile, displayName)
        await interaction.followUp({ embeds: [embed] })
    }
}