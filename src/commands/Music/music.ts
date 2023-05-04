import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, CommandInteraction, SelectMenuInteraction } from "discord.js";
import { Client, SelectMenuComponent } from "discordx";
import { injectable } from "tsyringe";
import { MusicHandler } from "./player";

@Discord()
@Category('Music')
@SlashGroup({ name: 'music', description: 'Play music in your voice channel' })
@SlashGroup('music')
@injectable()
export class Music {
    constructor(private player: MusicHandler) { }

    @Slash({ description: "Play music in your voice channel" })
    async play(
        @SlashOption({
            description: "Name of the song to play",
            name: "query",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        query: string,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        this.player.use(client, interaction)
        await this.player.play(query)
    }

    @Slash({ description: "Seek a time in the currently playing music" })
    async seek(
        @SlashOption({
            description: "How many seconds you want to skip in the current song",
            name: "seconds",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        seconds: number,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        this.player.use(client, interaction)
        await this.player.seek(seconds)
    }

    @Slash({ description: "Skip the currently playing music" })
    async skip(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.skip()
    }

    @Slash({ description: "Stop the currently playing music" })
    async stop(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.stop()
    }

    @Slash({ description: "Pause the currently playing music" })
    async pause(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.pause()
    }

    @Slash({ description: "Resume playing music" })
    async resume(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.resume()
    }

    @Slash({ description: "Shuffle music in the currently playing queue" })
    async shuffle(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.shuffle()
    }

    @Slash({ description: "Loop the entire queue" })
    async loop(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.loop()
    }

    @Slash({ description: "repeat currently playing music" })
    async repeat(interaction: CommandInteraction, client: Client) {
        this.player.use(client, interaction)
        await this.player.repeat()
    }

    @Slash({ description: "Save the playlist with a custom playlist name" })
    async save(
        @SlashOption({
            description: "Name of the playlist",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction,
        client: Client
    ) {
        this.player.use(client, interaction)
        await this.player.save(name)
    }

    @Slash({ description: "Load a saved playlist" })
    async load(
        interaction: CommandInteraction,
        client: Client
    ) {
        this.player.use(client, interaction)
        await this.player.displayPlaylists()
    }

    @Slash({ description: "Delete a playlist by specifying it's name" })
    async delete(
        @SlashOption({
            description: "Name of the playlist",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction,
        client: Client
    ) {
        this.player.use(client, interaction)
        await this.player.delete(name)
    }

    @Slash({ description: "Show the currently playing music" })
    async playing(
        interaction: CommandInteraction,
        client: Client
    ) {
        this.player.use(client, interaction)
        await this.player.view()
    }

    @Slash({ description: "Show the currently playing music" })
    async clear(
        interaction: CommandInteraction,
        client: Client
    ) {
        this.player.use(client, interaction)
        await this.player.clear()
        await this.player.skip()
    }

    @SelectMenuComponent({ id: "playlist-menu" })
    async handle(interaction: SelectMenuInteraction): Promise<unknown> {
        // extract selected value by member
        const playlistName = interaction.values?.[0];

        // if value not found
        if (!playlistName) {
            return interaction.followUp("invalid playlist name, select again");
        }

        //await interaction.message.delete()
        await this.player.clear()
        await this.player.load(playlistName)
        return
    }
}