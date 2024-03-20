import { Discord, Guard, Slash, SlashChoice, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { Disabled, NotBot } from "@guards";
import { LobbyService, ProfileService } from "@services";
import { resolveEmoji, simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Client } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'find', description: 'Matchmaking for RS, WS, Corps and trades', root: 'hades' })
@SlashGroup('find', 'hades')
export default class LobbyCommand {

    constructor(private service: LobbyService, private profileService: ProfileService) { }

    @Slash({
        name: 'rs',
        description: "Create a public or private red star lobby"
    })
    @Guard(NotBot, Disabled)
    async rs(
        @SlashChoice(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)
        @SlashOption({
            description: "The Red Star Level of the queue you want to join",
            name: "level",
            type: ApplicationCommandOptionType.Integer,
            required: true
        })
        rslevel: number,
        @SlashOption({
            description: "Testing ",
            name: "member",
            type: ApplicationCommandOptionType.User,
            required: false
        })
        guildMember: AllGuildMemberTypes,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!interaction.member) return;

        let userProfile = await this.profileService.getMemberProfile(interaction.member.user.id)

        if (guildMember) userProfile = await this.profileService.getMemberProfile(guildMember.user.id)
        if (!userProfile?.initialized) return await simpleErrorEmbed(interaction, `Create your in game profile first by using /hades profile set`)

        const queue = await this.service.findLobby(rslevel, userProfile)
        if (!queue) return await simpleErrorEmbed(interaction, 'An error occured while joining the queue please retry.')

        const embed = new EmbedBuilder()
            .setTitle(`Users waiting for RS${rslevel} lobby: ${queue.size}`)
            .setColor(Colors.DarkRed)
        queue.forEach(member => {
            embed.addFields(
                {
                    name: 'IGN',
                    value: member.user.ign,
                    inline: true
                },
                {
                    name: 'Mods',
                    value: [...member.user.rsMods].map(mod => `<:${resolveEmoji(interaction, mod)?.identifier ?? mod}>`).join(' '),
                    inline: true
                },
                {
                    name: 'Joined',
                    value: `<t:${member.timeJoined}:R>`,
                    inline: true
                }
            )
        }
        )

        if (queue.size < 4) {
            await interaction.editReply({ embeds: [embed] })
        } else {
            // Ping everyone involved to start RS queue
            const memberIds = [...queue.keys()]
            const embed = new EmbedBuilder()
                .setTitle(`RS${rslevel} Lobby ready!`)
                .setDescription(`${memberIds.map(id => "<" + id + ">").join("\n")} React below to confirm that you are ready to run the RS.\nAs soon as all the participants confirm their presence, the RS will start`)
            await interaction.followUp({ embeds: [embed] })
        }

        return;
    }
}