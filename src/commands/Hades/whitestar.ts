import { Discord, Slash, SlashGroup } from "@decorators";
import { Category } from "@discordx/utilities";
import { CommandInteraction } from "discord.js";
import { Client } from "discordx";

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
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {

    }
}