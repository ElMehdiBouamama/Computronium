import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { simpleSuccessEmbed } from "../../utils/functions";

@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'redstar', description: 'Red Stars Queuing system', root: 'hades' })
@SlashGroup('redstar', 'hades')
export default class WhiteStarCommand {

    constructor() { }

    @Slash({
        description: "Join a red star queue"
    })
    async join(
        @SlashOption({
            description: "Red Star Level",
            name: "level",
            type: ApplicationCommandOptionType.Number,
            required: true
        })
        rsLevel: string,
        interaction: CommandInteraction
    ): Promise<void> {
        // Queue System for red star
        simpleSuccessEmbed(interaction, "@" + interaction.user.tag + " queued in rsLevel: " + rsLevel)
    }
} 