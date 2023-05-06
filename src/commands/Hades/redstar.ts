import { RSQueueService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { SlashChoice } from "@decorators";
import { NotBot } from "@guards";

@Discord()
@injectable()
@SlashGroup({ name: 'redstar', description: 'Red Stars Queuing system', root: 'hades' })
@SlashGroup('redstar', 'hades')
export default class HadesRedStarCommand {

    constructor(private service: RSQueueService) {

    }

    @Slash({
        description: "Create a Red Star Queue"
    })
    @Guard(
        NotBot
    )
    async create(
        @SlashChoice(4,5,6,7,8,9,10,11)
        @SlashOption({
            description: "The Red Star Level of the queue you want to join",
            name: "level",
            type: ApplicationCommandOptionType.Integer,
            required: true
        })
        rslevel: number,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!rslevel || rslevel < 1 || rslevel > 11) return await simpleErrorEmbed(interaction, `Please enter a valid rslevel`)
        const success = await this.service.createRSQueue(rslevel, interaction.user)
        if (!success) return await simpleErrorEmbed(interaction, 'An error occured while adding your APIKey to the database')
        return await simpleSuccessEmbed(interaction, `Red Star ${rslevel} Queue created!`)
    }

}