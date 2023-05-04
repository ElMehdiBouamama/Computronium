import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Guard } from "discordx";
import { injectable } from "tsyringe";
import { NotBot, UserPermissions } from "../../guards";
import { HadesService } from "../../services/Hades";
import { simpleErrorEmbed, simpleSuccessEmbed } from "../../utils/functions";

@Discord()
@injectable()
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
        interaction: CommandInteraction
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
        client: Client
    ): Promise<void> {
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command can only run inside a discord server`)
        const techData = await this.service.get(interaction.guildId, interaction.user.id)
        // This should be in a guard function
        if (!techData || techData.array.length == 0) return await simpleErrorEmbed(interaction, 'You have to link your hades compendium app first before proceeding, use %transferdata to link load your data')
        
        await interaction.guild?.emojis.fetch()

        let [list, chunkSize] = [techData.array, 25]
        list = [...Array(Math.ceil(list.length / chunkSize))].map(_ => list.splice(0, chunkSize))

        let embedArr: EmbedBuilder[] = []

        list.forEach(async (el: any[]) => {

            const embed = new EmbedBuilder()
                .setColor(Colors.Blurple)

            el.forEach(async (item: { type: string; level: { toString: () => any; }; }) => {
                try {
                    const emoji = client.emojis.cache.find(emoji => emoji.name == item.type)
                    embed.addFields({ name: emoji?.identifier ? `<:${emoji?.identifier}>` : item.type, value: `${item.level.toString()}`, inline: true });
                } catch (error) {
                    console.log(error)
                }
            })

            embedArr.push(embed)
        });

        await interaction.followUp({ content: ' ', embeds: embedArr })
    }
}