import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { Client } from "discordx";
import { Category } from "@discordx/utilities";
import { MusicPlayer } from "./player";

@Discord()
@Category('Music')
@SlashGroup({ name: 'music', description: 'Play music in your voice channel' })
@SlashGroup('music')
export class Music {
    constructor() { }

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

        const player = new MusicPlayer(client, interaction)
        await player.play(query)
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
        const player = new MusicPlayer(client, interaction)
        await player.seek(seconds)
    }

    @Slash({ description: "Skip the currently playing music" })
    async skip(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.skip()
    }

    @Slash({ description: "Stop the currently playing music" })
    async stop(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.stop()
    }

    @Slash({ description: "Pause the currently playing music" })
    async pause(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.pause()
    }

    @Slash({ description: "Resume playing music" })
    async resume(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.resume()
    }

    @Slash({ description: "Shuffle music in the currently playing queue" })
    async shuffle(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.shuffle()
    }

    @Slash({ description: "Loop the entire queue" })
    async loop(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.loop()
    }

    @Slash({ description: "repeat currently playing music" })
    async repeat(interaction: CommandInteraction, client: Client) {
        const player = new MusicPlayer(client, interaction)
        await player.repeat()
    }

    //@Slash({ description: "Save the playlist with a custom playlist name" })
    //async save(
    //    @SlashOption({
    //        description: "Name of the playlist",
    //        name: "name",
    //        required: true,
    //        type: ApplicationCommandOptionType.String,
    //    })
    //    name: string,
    //    interaction: CommandInteraction,
    //    client: Client
    //) {
    //    const player = new MusicPlayer(client, interaction)
    //    player.save(name)
    //}

    @Slash({ description: "Show the currently playing music" })
    async playing(
        interaction: CommandInteraction,
        client: Client
    ) {
        const player = new MusicPlayer(client, interaction)
        await player.view()
    }
}