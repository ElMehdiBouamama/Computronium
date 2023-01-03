import { Status } from "@discordx/lava-player";
import type { Player } from "@discordx/lava-queue";
import { Queue } from "@discordx/lava-queue";
import { MusicService } from "@services";
import { APIEmbedField, Colors, EmbedBuilder, GuildMember, TextBasedChannel } from "discord.js";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export class MusicQueue extends Queue {
    channel?: TextBasedChannel;

    constructor(player: Player, guildId: string, private musicService?: MusicService) {
        super(player, guildId);
    }

    get isPlaying(): boolean {
        return this.lavaPlayer.status === Status.PLAYING;
    }

    view(member: GuildMember) {
        const fields: APIEmbedField[] = []
        var i = 0

        this.tracks.slice(0, 25).forEach(track => {
            fields.push({
                name: `${++i}. ${(track).info.title}`,
                value: track.info.uri,
                inline: false
            })
            return track
        })

        if (member.user) {
            if (this.currentTrack?.info) {
                return new EmbedBuilder()
                    .setTitle(':star: Queue Informations')
                    .addFields(fields)
                    .setDescription(`**Currently playing :** [${this.currentTrack.info.title}](${this.currentTrack.info.uri})\n\n${this.size === 0 ? '**Queue is empty**' : '**Queued music:**\n'}`)
                    .setColor(Colors.Gold)
                    .setAuthor({
                        name: member.user.tag.toString(),
                        iconURL: member.user.avatarURL({ size: 32 }) ?? ''
                    })
                    .setThumbnail(`https://i.ytimg.com/vi/${this.currentTrack.info.identifier}/0.jpg`)
                    .setFooter({ text: `loop: ${this.loop ? 'on' : 'off'} -- repeat: ${this.repeat ? 'on' : 'off'}` })
            }
            else {
                return new EmbedBuilder()
                    .setTitle(':star: Queue Informations')
                    .setDescription(`\n**No music currently playing**\n You can queue up music using the /music play command`)
                    .setColor(Colors.Gold)
                    .setAuthor({
                        name: member.user.tag.toString(),
                        iconURL: member.user.avatarURL({ size: 32 }) ?? ''
                    })
            }
        }
        return new EmbedBuilder()
            .setTitle(':star: Queue Informations')
            .setDescription(`Could not process your request`)
            .setColor(Colors.Red)
    }

    async save(playlistName: string, member: GuildMember): Promise<boolean> {
        if (!this.musicService || !this.currentTrack) return false
        const tracksToSave = [this.currentTrack.info.identifier, ...this.tracks.map(track => track.info.identifier)]
        await this.musicService.addTracks(this.guildId, member.id, playlistName, tracksToSave)
        return true
    }

    async load(playlistName: string, member: GuildMember): Promise<boolean> {
        if (!this.musicService) return false
        const tracks = await this.musicService.getPlaylist(this.guildId, member.id, playlistName)
        if (tracks) {
            const songIds = [...tracks.values()]
            for (var songId in songIds) {
                await this.enqueue(songIds[songId])
            }
            await this.lavaPlayer.join(member.voice.channelId)
            this.playNext()
        }
        return true
    }

    async delete(playlistName: string, member: GuildMember): Promise<boolean> {
        if (!this.musicService) return false
        await this.musicService.deletePlaylist(this.guildId, member.id, playlistName)
        return true
    }

    async getPlaylists(member: GuildMember): Promise<string[]> {
        if (!this.musicService) return []
        return await this.musicService.getUser(this.guildId, member.id)
    }
}