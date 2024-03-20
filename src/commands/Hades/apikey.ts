import { Discord, Ephemeral, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { Disabled, NotBot, UserPermissions } from "@guards";
import { CompendiumService } from "@services";
import { simpleErrorEmbed, simpleSuccessEmbed } from "@utils/functions";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Client, Guard } from "discordx";
import { injectable } from "tsyringe";

@injectable()
@Discord()
@Category('Hades Star')
@SlashGroup({ name: 'apikey', description: 'Manage HS compendium API keys', root: 'hades' })
@SlashGroup('apikey', 'hades')
export default class ApiKeyCommand {

    constructor(private service: CompendiumService) { }

    @Slash({
        name: 'set',
        description: "Set the HS compendium API key to link HS compendium to computronium"
    })
    @Guard(UserPermissions(['Administrator']), NotBot, Disabled)
    async set(
        @SlashOption({
            description: "Use %apikey to get your API key",
            name: "key",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        APItoken: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        if (!APItoken) return await simpleErrorEmbed(interaction, `Please enter an API Key!`)
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command is only available in discord servers!`)

        const success = await this.service.setKey(interaction.guildId, APItoken)
        if (!success) return await simpleErrorEmbed(interaction, 'An error occured while adding your APIKey to the database')

        return await simpleSuccessEmbed(interaction, 'Your API key has been registered!')
    }

    @Ephemeral()
    @Slash({
        name: 'get',
        description: "Get the APIKey for this server"
    })
    @Guard(UserPermissions(['Administrator']), NotBot, Disabled)
    async get(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.guildId) return await simpleErrorEmbed(interaction, `This command is only available in discord servers!`)
        const apiKey = await this.service.getKey(interaction.guildId)
        return await simpleSuccessEmbed(interaction, `Here is your API key: ${apiKey}`)
    }
}