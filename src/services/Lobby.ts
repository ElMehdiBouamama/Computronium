import { BaseHSProfile } from "@utils/classes";
import { Collection } from "discord.js";
import { singleton } from "tsyringe";
import { Schedule } from "@decorators";

@singleton()
export class LobbyService {

    private rsQueues: Collection<number, Map<string, QueueData>>

    constructor() {
        this.rsQueues = new Collection<number, Map<string, QueueData>>()
        for (var i = 4; i < 12; i++) {
            this.rsQueues.set(i, new Map<string, QueueData>())
        }
    }

    findLobby(rslevel: number, profile: BaseHSProfile): Map<string, QueueData> {
        // Get and add the player to the queue for the selected RS level
        const queue = this.getQueueMembers(rslevel)
        if (!queue.has(profile.userId))
            queue.set(profile.userId, { timeJoined: Math.floor(Date.now() / 1000), user: profile })
        return queue
    }

    getQueueMembers(rslevel: number): Map<string, QueueData> {
        return this.rsQueues.get(rslevel) ?? new Map<string, QueueData>()
    }

    //@Schedule('*/15 * * * * *')
    async test() {
        console.log("Cron fires")
    }

}

interface QueueData {
    timeJoined: number,
    user: BaseHSProfile
}