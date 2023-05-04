import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'whitestar', description: 'White Stars', root: 'hades' })
@SlashGroup('whitestar', 'hades')
export default class WhiteStarCommand {

    constructor() { }

    @Slash({
        description: "Signup to a white star"
    })
    async signup(
        interaction: CommandInteraction
    ): Promise<void> {

    }
}