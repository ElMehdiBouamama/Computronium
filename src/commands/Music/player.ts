import { LoadType, Status, TrackResponse } from "@discordx/lava-player";
import { Player } from "@discordx/lava-queue";
import { Player as PlayerWrapper } from "@discordx/music";
import { replyToInteraction, simpleErrorEmbed, simpleSuccessEmbed } from '@utils/functions';
import { CommandInteraction, EmbedBuilder, Guild, GuildMember, TextBasedChannel } from "discord.js";
import { Client } from "discordx";
import { getNode } from "./node";
import { MusicQueue } from './queue';

export class MusicPlayer extends PlayerWrapper {
    static players: Record<string, Player> = {} // botId with their respective players

    constructor(private client: Client, private interaction: CommandInteraction) {
        super()
        // Check if lava player exist for the bot if it doesn't create a lavalink player with default parameters
        if (!MusicPlayer.players[this.client.botId]) {
            MusicPlayer.players[client.botId] = new Player(getNode(client))
        }
    }

    GetQueue(): MusicQueue | null {
        const player = MusicPlayer.players[this.client.botId]
        if (!player || !this.interaction.guildId) {
            return null
        }

        const queue = new MusicQueue(player, this.interaction.guildId)
        return player.queue(this.interaction.guildId, () => queue)
    }

    private async validateCommand(
        skipBotChannel = false
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

        if (!this.interaction.member.voice.channelId) {
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

        const queue = this.GetQueue();

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

        let response: TrackResponse;

        const searchResponse = await queue.search(`ytsearch:${query}`)
        const track = searchResponse.tracks[0]
        if (!track) {
            await simpleErrorEmbed(this.interaction, `Couldn't find this song`)
            return
        }

        queue.tracks.push(track);
        response = {
            loadType: LoadType.TRACK_LOADED,
            playlistInfo: {},
            tracks: [track],
        }


        await queue.lavaPlayer.join(member.voice.channelId, {
            deaf: true,
        })

        queue.channel = channel

        if (
            queue.lavaPlayer.status === Status.INSTANTIATED ||
            queue.lavaPlayer.status === Status.UNKNOWN ||
            queue.lavaPlayer.status === Status.ENDED
        ) {
            queue.playNext()
        }

        if (response.playlistInfo.name) {
            //await simpleSuccessEmbed(this.interaction, `Added ${response.tracks.length} from ${response.playlistInfo.name}`)
        } else if (response.tracks.length === 1) {
            // await simpleSuccessEmbed(this.interaction, `Added [${response.tracks[0]?.info.title}](<${response.tracks[0]?.info.uri}>)`)
        } else {
            //await simpleSuccessEmbed(this.interaction, `Added ${response.tracks.length}`)
        }

        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
        return
    }

    async seek(seconds: number): Promise<void> {

        const cmd = await this.validateCommand(false);
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
        const cmd = await this.validateCommand(false)
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
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return
        }
        const { queue } = cmd
        if (queue.isPlaying) {
            queue.stop()
            queue.lavaPlayer.leave()
            return await simpleSuccessEmbed(this.interaction, `Stopped music`)
        }
        return await simpleErrorEmbed(this.interaction, `No music is currently playing`)
    }

    async pause(): Promise<void> {
        const cmd = await this.validateCommand(false)
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
        const cmd = await this.validateCommand(false)
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
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.shuffle()
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async loop(): Promise<void> {
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.setLoop(!queue.loop)
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async repeat(): Promise<void> {
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return
        }
        const { queue, member } = cmd
        queue.setRepeat(!queue.repeat)
        const embed = queue.view(member)
        await this.interaction.followUp({ embeds: [embed] })
    }

    async save(name: string): Promise<boolean> {
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return false
        }
        const { queue, member, channel } = cmd
        queue.save(name, member)
        return false
    }

    async load(name: string): Promise<boolean> {
        const cmd = await this.validateCommand(false)
        if (!cmd) {
            return false
        }
        const { queue, member, channel } = cmd
        let playlist: string[] = []
        return false
    }

    async view(): Promise<void> {
        const cmd = await this.validateCommand(true)
        if (!cmd) {
            return;
        }
        const { queue, member } = cmd
        const embed = await queue.view(member)
        console.log(embed)
        await this.interaction.followUp({ embeds: [embed] })
    }
}
