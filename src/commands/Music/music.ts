import type { CommandInteraction, Guild, TextBasedChannel } from "discord.js";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";

import { Discord, Slash, SlashGroup, SlashOption } from "@decorators";
import type { Queue } from "@discordx/music";
import { Player } from "@discordx/music";
import { Category } from "@discordx/utilities";
import { simpleErrorEmbed, simpleSuccessEmbed } from "../../utils/functions";

@Discord()
@Category('Music')
@SlashGroup({ description: "Listen to music", name: "music" })
@SlashGroup("music")
export class music {
    player: Player;
    channel: TextBasedChannel | undefined;

    constructor() {
        this.player = new Player();

        this.player.on("onStart", ([, track]) => {
            if (this.channel) {
                //this.channel.send(`playing ${track.title} ${track.url ?? ""}`);
            }
        });

        this.player.on("onFinishPlayback", () => {
            if (this.channel) {
                //this.channel.send(
                //    "all songs has been played, please queue up more songs :musical_note:"
                //);
            }
        });

        this.player.on("onPause", () => {
            if (this.channel) {
                //this.channel.send("music paused");
            }
        });

        this.player.on("onResume", () => {
            if (this.channel) {
                //this.channel.send("music resumed");
            }
        });

        this.player.on("onError", ([, err, track]) => {
            if (this.channel) {
                this.channel.send(
                    `Track: ${track.source}\nError: \`\`\`${err.message}\`\`\``
                );
            }
        });

        this.player.on("onFinish", ([, track]) => {
            if (this.channel) {
                //this.channel.send(`Finished playing: ${track.title}`);
            }
        });

        this.player.on("onLoop", () => {
            if (this.channel) {
                //this.channel.send("music resumed");
            }
        });

        this.player.on("onRepeat", () => {
            if (this.channel) {
                //this.channel.send("music resumed");
            }
        });

        this.player.on("onSkip", () => {
            if (this.channel) {
                //this.channel.send("music resumed");
            }
        });

        this.player.on("onTrackAdd", ([, track]) => {
            if (this.channel) {
                //this.channel.send(`:star: ${track.length} Song In Queue`);
            }
        });

        this.player.on("onLoopEnabled", () => {
            if (this.channel) {
                //this.channel.send("loop mode enabled");
            }
        });

        this.player.on("onLoopDisabled", () => {
            if (this.channel) {
                //this.channel.send("loop mode disabled");
            }
        });

        this.player.on("onRepeatEnabled", () => {
            if (this.channel) {
                //this.channel.send("repeat mode enabled");
            }
        });

        this.player.on("onRepeatDisabled", () => {
            if (this.channel) {
                //this.channel.send("repeat mode disabled");
            }
        });

        this.player.on("onMix", ([, tracks]) => {
            if (this.channel) {
                //this.channel.send(`mixed tracks: ${tracks.length}`);
            }
        });

        this.player.on("onVolumeUpdate", ([, volume]) => {
            if (this.channel) {
                //this.channel.send(`volume changed to: ${volume}`);
            }
        });
    }

    queue(guild: Guild): Queue {
        return this.player.queue(guild);
    }

    @Slash({ description: "Play a song" })
    async play(
        @SlashOption({
            description: "song url or title",
            name: "song",
            type: ApplicationCommandOptionType.String,
        })
        songName: string,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        if (
            !(interaction.member instanceof GuildMember) ||
            !interaction.member.voice.channel
        ) {
            simpleErrorEmbed(interaction, "You are not in the voice channel")
            return;
        }

        const queue = this.queue(interaction.guild);
        if (!queue.isReady) {
            this.channel = interaction.channel ?? undefined;
            await queue.join(interaction.member.voice.channel);
        }
        const status = await queue.play(songName);
        if (!status) {
            simpleErrorEmbed(interaction, "The song could not be found")
        } else {
            const track = (queue.size > 0) ? queue.tracks[queue.size - 1] : queue.currentTrack?.metadata;
            if (track) {
                simpleSuccessEmbed(interaction, `${track.title}\n${track.url ?? ""}\n:star: ${queue.tracks.length + 1} Song In Queue`);
            }
        }
    }

    @Slash({ description: "Play a playlist" })
    async playlist(
        @SlashOption({
            description: "playlist name",
            name: "playlist",
            type: ApplicationCommandOptionType.String,
        })
        playlistName: string,
        interaction: CommandInteraction,
        { localize }: InteractionData
    ): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        if (
            !(interaction.member instanceof GuildMember) ||
            !interaction.member.voice.channel
        ) {
            simpleErrorEmbed(interaction, 'You are not in the voice channel');
            return;
        }

        const queue = this.queue(interaction.guild);
        if (!queue.isReady) {
            this.channel = interaction.channel ?? undefined;
            await queue.join(interaction.member.voice.channel);
        }
        const status = await queue.playlist(playlistName);
        if (!status) {

            simpleErrorEmbed(interaction, 'The playlist could not be found');
        } else {
            simpleSuccessEmbed(interaction, 'Playlist Loaded');
        }
    }

    //@Slash({ description: "Play custom track", name: "custom-track" })
    //async customTrack(
    //    interaction: CommandInteraction,
    //    { localize }: InteractionData
    //): Promise<void> {
    //    if (!interaction.guild) {
    //        return;
    //    }

    //    if (
    //        !(interaction.member instanceof GuildMember) ||
    //        !interaction.member.voice.channel
    //    ) {
    //        interaction.editReply("You are not in the voice channel");
    //        return;
    //    }

    //    const queue = this.queue(interaction.guild);
    //    if (!queue.isReady) {
    //        this.channel = interaction.channel ?? undefined;
    //        await queue.join(interaction.member.voice.channel);
    //    }

    //    queue.playTrack(
    //        new CustomTrack(
    //            this.player,
    //            "My Custom Track",
    //            join(__dirname, "file.mp3")
    //        )
    //    );
    //    await interaction.editReply("queued custom track");
    //}

    validateInteraction(
        interaction: CommandInteraction
    ): undefined | { guild: Guild; member: GuildMember; queue: Queue } {
        if (!interaction.guild || !(interaction.member instanceof GuildMember)) {
            simpleErrorEmbed(interaction, "Could not process your request");
            return;
        }

        if (!interaction.member.voice.channel) {
            simpleErrorEmbed(interaction, "You are not in the voice channel");
            return;
        }

        const queue = this.queue(interaction.guild);

        if (!queue.isReady) {
            simpleErrorEmbed(interaction, "I'm not ready yet");
            return;
        }

        if (interaction.member.voice.channel.id !== queue.voiceChannelId) {
            simpleErrorEmbed(interaction, "you are not in my voice channel");
            return;
        }

        return { guild: interaction.guild, member: interaction.member, queue };
    }

    @Slash({ description: "skip music" })
    skip(interaction: CommandInteraction,
        { localize }: InteractionData
    ): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;

        queue.skip();
        const track = queue.currentTrack?.metadata;
        const queueInfo = ':star: ' + queue.size + ' Song In Queue';
        if (track) {
            simpleErrorEmbed(interaction, track.title + '\n' + track.url + '\n' + queueInfo);
        } else { 
            simpleSuccessEmbed(interaction, queueInfo);
        }
    }

    @Slash({ description: "shuffle the queue" })
    shuffle(interaction: CommandInteraction,
        { localize }: InteractionData): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;

        queue.mix();
        simpleSuccessEmbed(interaction, 'Queue Shuffled')
    }

    @Slash({ description: "pause music" })
    pause(interaction: CommandInteraction,
        { localize }: InteractionData
    ): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;

        if (queue.isPause) {
            simpleErrorEmbed(interaction, "Already Paused");
            return;
        }

        queue.pause();
        simpleSuccessEmbed(interaction, 'Music Paused');
    }

    @Slash({ description: "resume music" })
    resume(interaction: CommandInteraction,
        { localize }: InteractionData): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;

        if (queue.isPlaying) {
            simpleErrorEmbed(interaction, "Already Playing");
            return;
        }

        queue.resume();
        simpleSuccessEmbed(interaction, 'Music Resumed')
    }

    @Slash({ description: "seek music" })
    seek(
        @SlashOption({
            description: "seek time in seconds",
            name: "time",
            type: ApplicationCommandOptionType.Number,
        })
        time: number,
        interaction: CommandInteraction,
        { localize }: InteractionData
    ): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;

        if (!queue.isPlaying || !queue.currentTrack) {
            simpleErrorEmbed(interaction, "Currently Not Playing Any Song");
            return;
        }

        const state = queue.seek(time * 1e3);
        if (!state) {
            simpleErrorEmbed(interaction, "Could Not Seek");
            return;
        }
        simpleSuccessEmbed(interaction, 'Current Music Seeked');
    }

    @Slash({ description: "stop music" })
    stop(interaction: CommandInteraction,
        { localize }: InteractionData
    ): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;
        queue.leave();
        simpleSuccessEmbed(interaction, 'Music Stopped');
    }

    @Slash({ description: "loop music" })
    loop(
        interaction: CommandInteraction,
        { localize }: InteractionData
    ): void {
        const validate = this.validateInteraction(interaction);
        if (!validate) {
            return;
        }

        const { queue } = validate;
        queue.setLoop(!queue.loop);
        simpleSuccessEmbed(interaction, 'Loop ' + (queue.loop? 'On' : 'Off'));
    }
}