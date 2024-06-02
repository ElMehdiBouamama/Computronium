import { Manager } from 'lavacord';
import type {
    VoiceServerUpdate,
    VoiceStateUpdate
} from "@discordx/lava-player";
import { Node } from "@discordx/lava-player";
import { GatewayDispatchEvents } from "discord.js";
import type { Client } from "discordx";

const nodes = [
    { id: "1", host: process.env.LAVA_HOST, port: process.env.LAVA_PORT, password: process.env.LAVA_PASSWORD }
];

export function getManager(client: Client): Node {
    const manager = new Manager(nodes, {
	user: client.user.id,
	send: (guildId, packet) => {
	    const guild = client.guilds.cache.get(guildId);
	    if((guild) {
		guild.shard.send(packet);
	    }
	}
    });

    const nodeX = new Node({
        host: {
            address: process.env.LAVA_HOST ?? "mehdi.bouamama.net",
            connectionOptions: { resumeKey: client.botId, resumeTimeout: 15 },
            port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : null
        },

        // your Lavalink password
        password: process.env.LAVA_PASSWORD ?? "youshallnotpass",

        send(guildId, packet) {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                guild.shard.send(packet);
            }
        },
        shardCount: 0, // the total number of shards that your bot is running (optional, useful if you're load balancing)
        userId: client.user?.id ?? "", // the user id of your bot
    });

    client.ws.on(
        GatewayDispatchEvents.VoiceStateUpdate,
        (data: VoiceStateUpdate) => {
            nodeX.voiceStateUpdate(data);
        }
    );

    client.ws.on(
        GatewayDispatchEvents.VoiceServerUpdate,
        (data: VoiceServerUpdate) => {
            nodeX.voiceServerUpdate(data);
        }
    );

    console.log(nodeX);

    return nodeX;
}
