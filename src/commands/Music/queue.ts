import { Status, Track } from "@discordx/lava-player";
import type { Player } from "@discordx/lava-queue";
import { Queue } from "@discordx/lava-queue";
import { APIEmbedField, Colors, Embed, EmbedBuilder, GuildMember, TextBasedChannel } from "discord.js";

export class MusicQueue extends Queue {
    channel?: TextBasedChannel;

    get isPlaying(): boolean {
        return this.lavaPlayer.status === Status.PLAYING;
    }

    constructor(player: Player, guildId: string) {
        super(player, guildId);
    }

    view(member: GuildMember) {
        const fields: APIEmbedField[] = []
        var i = 0

        this.tracks.forEach(track => {
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
                    .setFooter({ text: `loop: ${this.loop ? 'on' : 'off'} --- repeat: ${this.repeat? 'on' : 'off'}`})
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

    save(name: string, member: GuildMember): boolean {
        return true
    }
}