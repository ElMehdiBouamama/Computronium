import { Discord, Guard, Slash, SlashChoice, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { NotBot } from "@guards";
import { RSQueueService } from "@services";
import { simpleErrorEmbed, simpleQuestionEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Client } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category("Hades Star")
@SlashGroup({ name: 'redstar', description: 'Red Stars Queuing system', root: 'hades' })
@SlashGroup('redstar', 'hades')
export default class HadesRedStarCommand {

    constructor(private service: RSQueueService) { }

    @Slash({
        description: "Create a Red Star Queue"
    })
    @Guard(
        NotBot
    )
    async create(
        @SlashChoice(4, 5, 6, 7, 8, 9, 10, 11)
        @SlashOption({
            description: "The Red Star Level of the queue you want to join",
            name: "level",
            type: ApplicationCommandOptionType.Integer,
            required: true
        })
        rslevel: number,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!rslevel || rslevel < 1 || rslevel > 11) return await simpleErrorEmbed(interaction, `Please enter a valid rslevel`)
        let userConfigExists = await this.service.userConfigExists(interaction.user)
        if (!userConfigExists) {
            /* Send embed to tell the user he needs to initialize his configs first */
            return await simpleQuestionEmbed(interaction, `First time usage of the RS Queue requires setting the Red Star Configs`, ["Proceed", "Cancel"])
        }
        const success = await this.service.createRSQueue(rslevel, interaction.user)
        if (!success) return await simpleErrorEmbed(interaction, 'An error occured while adding your APIKey to the database')
        return await simpleSuccessEmbed(interaction, `Red Star ${rslevel} queue created!`)
    }

}