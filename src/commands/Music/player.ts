import { Status } from "@discordx/lava-player";
import { Player } from "@discordx/lava-queue";
import { Player as PlayerWrapper } from "@discordx/music";
import { simpleErrorEmbed, simpleSuccessEmbed } from '@utils/functions';
import { ActionRowBuilder, CommandInteraction, Guild, GuildMember, MessageActionRowComponentBuilder, SelectMenuInteraction, StringSelectMenuBuilder, TextBasedChannel } from "discord.js";
import { Client } from "discordx";
import { injectable, singleton } from "tsyringe";
import { MusicService } from "../../services";
import { getNode } from "./node";
import { MusicQueue } from './queue';

@singleton()
@injectable()
export class MusicHandler extends PlayerWrapper {
    static players: Record<string, Player> = {} // botId with their respective players
    private interaction: CommandInteraction | SelectMenuInteraction
    private client: Client

    constructor(private musicService: MusicService) {
        super()
    }

    use(client: Client, interaction: CommandInteraction | SelectMenuInteraction) {
        this.interaction = interaction
        this.client = client
        // Check if lava player exist for the bot if it doesn't create a lavalink player with default parameters
        if (!MusicHandler.players[this.client.botId]) {
            MusicHandler.players[client.botId] = new Player(getNode(client))
        }
    }

    private sanitize(text: string) {
        try {
            new URL(text)
        } catch (_) {
            return
        }
        return text
    }

    getQueue(): MusicQueue | null {
        const player = MusicHandler.players[this.client.botId]
        if (!player || !this.interaction.guildId) {
            return null
        }

        const queue = new MusicQueue(player, this.interaction.guildId)
        return player.queue(this.interaction.guildId, () => queue)
    }

    private async validateCommand(
        // Skips the verification process to see if the bot is in a voice channel or not, skips the verificiation to see if the requesting members is a voice channel or not
        skipBotChannel = false, skipMemberChannel = false
    ): Promise<
        | {
            channel: TextBasedChannel
            guild: Guild
            member: GuildMember
            queue: MusicQueue
        }
        | undefined
    > {
        if (
            !this.interaction.channel ||
            !(this.interaction.member instanceof GuildMember) ||
            !this.interaction.guild ||
            !this.interaction.client.user
        ) {
            await simpleErrorEmbed(this.interaction, `The command could not be processed. Please try again`)
            return
        }

        if (!skipMemberChannel && !this.interaction.member.voice.channelId) {
            await simpleErrorEmbed(this.interaction, `Join a voice channel first`)
            return
        }

        const bot = this.interaction.guild?.members.cache.get(
            this.interaction.client.user?.id
        );

        if (!bot) {
            await simpleErrorEmbed(this.interaction, `Having difficulty finding my place in this world`)
            return
        }

        if (
            !skipBotChannel &&
            this.interaction.member.voice.channelId !== bot.voice.channelId
        ) {
            await simpleErrorEmbed(this.interaction, `I am already in a voice channel`)
            return
        }

        const queue = this.getQueue();

        if (!queue) {
            await simpleErrorEmbed(this.interaction, `The player is not ready yet, please wait`)
            return
        }

        return {
            channel: this.interaction.channel,
            guild: this.interaction.guild,
            member: this.interaction.member,
            queue,
        }
    }

    async play(query: string): Promise<void> {

        const cmd = await this.validateCommand(true);
        if (!cmd) {
            return;
        }
        const { queue, member, channel } = cmd

        const url = this.sanitize(query)

        const searchResponse = await queue.search(url ?? 'ytsearch:' + query)

        if (searchResponse) {

            const tracks = searchResponse.playlistInfo.name ? searchResponse.tracks : [searchResponse.tracks[0]]

            if (!tracks) {
                await simpleErrorEmbed(this.interaction, `Couldn't find this song`)
                return
            }

            queue.tracks.push(...tracks);

            await queue.lavaPlayer.join(member.voice.channelId, { deaf: false })

            queue.channel = channel

            if (
                queue.lavaPlayer.status === Status.INSTANTIATED ||
                queue.lavaPlayer.status === Status.UNKNOWN ||
                queue.lavaPlayer.status === Status.ENDED
            ) {
                queue.playNext()
            }

            const embed = queue.view(member)
            await this.interaction.followUp({ embeds: [embed] })
            return
        }
    }

    async seek(seconds: number): Promise<void> {

        const cmd = await this.validateCommand();
        if (!cmd) {
            return
        }

        const { queue } = cmd;

        if (!queue.currentTrack) {
            await simpleErrorEmbed(this.interaction, `There is no music currently playing`)
            return
        }

        if (!queue.currentTrack.info.isSeekable) {
            await simpleErrorEmbed(this.interaction, `This music can't be seeked`)
            return
        }

        if (seconds * 1000 > queue.currentTrack.info.length) {
            queue.playNext()
            await simpleSuccessEmbed(this.interaction, `Skipped music`)
            return
        }

        queue.lavaPlayer.play(queue.currentTrack, { start: seconds * 1000 })
        await simpleSuccessEmbed(this.interaction, `Current music time seeked`)
        return
    }

    async skip(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        const skipped = queue.playNext()
        if (!skipped) {
            queue.stop()
        }
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
        return
    }

    async stop(): Promise<void> {
        const cmd = await this.validateCommand(true)
        if (!cmd) {
            return
        }
        const { queue } = cmd
        if (queue.isPlaying) {
            queue.stop()
        }
        await queue.lavaPlayer.leave()
        return await simpleSuccessEmbed(this.interaction, `Stopped music`)
    }

    async pause(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue } = cmd
        if (queue.isPlaying) {
            queue.pause()
            return await simpleSuccessEmbed(this.interaction, `Stopped music`)
        }
        return await simpleErrorEmbed(this.interaction, `No music is currently playing`)
    }

    async resume(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue } = cmd
        if (!queue.isPlaying) {
            queue.resume()
            return await simpleSuccessEmbed(this.interaction, `Resumed music`)
        }
        return await simpleErrorEmbed(this.interaction, `No music is currently playing`)
    }

    async shuffle(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.shuffle()
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async loop(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.setLoop(!queue.loop)
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async repeat(): Promise<void> {
        const cmd = await this.validateCommand(false, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.setRepeat(!queue.repeat)
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async save(name: string): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            await simpleErrorEmbed(this.interaction, `An error occured while saving the playlist`)
            return
        }
        const { queue, member } = cmd
        const saved = await queue.save(name, member)
        if (saved) {
            await simpleSuccessEmbed(this.interaction, `Playlist saved as **${name}**!`)
        } else {
            await simpleErrorEmbed(this.interaction, `An error occured while saving the playlist`)
        }
        return
    }

    async load(name: string): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        const loaded = await queue.load(name, member)
        if (loaded) {
            await this.view()
        } else {
            await simpleErrorEmbed(this.interaction, `An error occured while loading the playlist`)
        }
        return
    }

    async delete(name: string): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        const deleted = await queue.delete(name, member)
        if (deleted) {
            await simpleSuccessEmbed(this.interaction, `Playlist **${name}** deleted!`)
        } else {
            await simpleErrorEmbed(this.interaction, `An error occured while deleting the playlist`)
        }
        return
    }

    async displayPlaylists(): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        const playlists = await queue.getPlaylists(member)
        if (playlists && playlists?.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .addOptions(playlists.map(playlist => { return { label: playlist, value: playlist } }))
                .setCustomId("playlist-menu")
                .setPlaceholder("Select the playlist you want to load")

            // create a row for message actions
            const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu)

            this.interaction.followUp({
                components: [buttonRow]
            })
        }
        else {
            simpleErrorEmbed(this.interaction, `You don't have any playlist saved you can queue up songs with /music play then save the playlist with /music save`)
        }
        return
    }

    async view(): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            return;
        }
        const { queue, member } = cmd
        const embed = await queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async clear(): Promise<void> {
        const cmd = await this.validateCommand(true, true)
        if (!cmd) {
            return;
        }
        const { queue, member } = cmd
        await queue.clear()
    }
}
