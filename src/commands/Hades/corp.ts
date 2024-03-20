import { Discord, Guard, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { Disabled, GuildOnly, NotBot } from "@guards";
import { ProfileService } from "@services";
import { BaseHSCorp, BaseHSProfile, StarId } from "@utils/classes";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from "discord.js";
import { Client } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'corp', description: 'Manage your HS corps', root: 'hades' })
@SlashGroup('corp', 'hades')
export default class CorpCommand {

    constructor(private service: ProfileService) { }

    @Slash({
        name: 'create',
        description: "Create a corp"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async create(
        @SlashOption({
            description: "The owner star id, example: SVA-8779",
            name: "star_id",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        _ownerStarId: string,
        @SlashOption({
            description: "The corp name",
            name: "name",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        corpName: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {

        if (!interaction.member) return; // Already processed by the guard

        if (!StarId.isValid(_ownerStarId))
            return await simpleErrorEmbed(interaction, '**Invalid Star ID** please enter the starID in the following format: **SVA-8779**')

        let currentUserProfile = await this.service.getMemberProfile(interaction.member.user.id)
        const ownerStarId = new StarId(_ownerStarId)

        if (!currentUserProfile)
            return await simpleErrorEmbed(interaction, `Setup your profile before joining a corp, use **/hades corp create**`)

        if (currentUserProfile.starId.letters !== ownerStarId.letters || 
            currentUserProfile.starId.numbers !== ownerStarId.numbers)
            return await simpleErrorEmbed(interaction, `Unauthorized: You can't create a corp that doesn't belong to you.`)

        let corpHSProfile = new BaseHSCorp(ownerStarId, corpName)

        const success = await this.service.updateUserCorp(ownerStarId, corpHSProfile)
        if (!success)
            return await simpleErrorEmbed(interaction, 'An error occured while saving the data, please try again!')

        await simpleSuccessEmbed(interaction, `Corp created successfully!\nYou can consult the corp details by using /hades corp get`)
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
        member: GuildMember,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!(interaction.member instanceof GuildMember)) return; // Already processed by the guard
        let targetUser: BaseHSProfile | undefined;

        if (starId) {

            if (!StarId.isValid(starId)) return await simpleErrorEmbed(interaction, '**Invalid Star ID** please enter the starID in the following format: **SVA-8779**')
            targetUser = await this.service.findUserByStarId(new StarId(starId))
        }
        else if (member) {
            targetUser = await this.service.getMemberProfile(member.user.id)
        } else {
            targetUser = await this.service.getMemberProfile(interaction.member.user.id)
        }

        if (!targetUser) return await simpleErrorEmbed(interaction, `No in game profile found with the provided data\n
            If you are **${member.displayName}**, then you can use **/hades set** to setup your in game profile!`)

        const embed = await this.service.generateCorpEmbed(targetUser)
        await interaction.followUp({ embeds: [embed] })
    }

    @Slash({
        name: 'join',
        description: "Join a corp"
    })
    @Guard(NotBot, GuildOnly, Disabled)
    async join(
        @SlashOption({
            description: "The owner star id, example: SVA-8779",
            name: "star_id",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        _ownerStarId: string,
        @SlashOption({
            description: "The corp name",
            name: "name",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        corpName: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {

        if (!interaction.member) return; // Already processed by the guard

        if (!StarId.isValid(_ownerStarId))
            return await simpleErrorEmbed(interaction, '**Invalid Star ID** please enter the starID in the following format: **SVA-8779**')

        let currentUserProfile = await this.service.getMemberProfile(interaction.member.user.id)
        const ownerStarId = new StarId(_ownerStarId)

        if (!currentUserProfile)
            return await simpleErrorEmbed(interaction, `Setup your profile before joining a corp, use **/hades corp set**`)

        const ownerProfile = await this.service.findUserByStarId(ownerStarId)
        if (!ownerProfile)
            return await simpleErrorEmbed(interaction, `The corp owner doesn't have a profile yet, the corp owner needs to create a profile and a corp first`)
        if (!ownerProfile.corp)
            return await simpleErrorEmbed(interaction, `The corp owner doesn't have a profile yet, the corp owner needs to create a corp first`)

        ownerProfile.corp.members.noRole.push(currentUserProfile.starId)

        let membersToUpdate = [ownerProfile.corp.members.firstOfficer, ...ownerProfile.corp.members.officers, ...ownerProfile.corp.members.noRole]

        if (membersToUpdate.includes(currentUserProfile?.starId))
            return await simpleErrorEmbed(interaction, 'You are already a member of this corp')

        membersToUpdate.map(memberStarId => this.service.updateUserCorp(memberStarId, ownerProfile.corp ?? new BaseHSCorp()))

        await simpleSuccessEmbed(interaction, `Corp joined successfully!\nYou can consult the corp details by using /hades corp get`)
    }

}