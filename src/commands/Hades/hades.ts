import { Discord, SlashGroup } from "@decorators";
import { Category } from "@discordx/utilities";
import { Disabled } from "../../guards";

@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'hades', description: 'Hades star related commands' })
@SlashGroup('hades')
export default class ProfileCommand {

    constructor() { }
}