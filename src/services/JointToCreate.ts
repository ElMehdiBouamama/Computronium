import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseJoinToCreate } from "@utils/classes";

@singleton()
export class JoinToCreate {

    constructor(
        private db: Database
    ) {
    }

    /**
     * Get join to create voice channels from the "data" table.
     * @param guildId
     */
    async getGuildChannels(guildId: string): Promise<BaseJoinToCreate> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`joinToCreate`)

        if (data) {
            const channels = data.find(x => x.guildId === guildId)

            if (channels) {
                return channels
            }

        }
        return new BaseJoinToCreate(guildId, [])
    }

    async addChannel(guildId: string, channelId: string) {

        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`joinToCreate`)
        var success = false

        if (!data) {
            data = [new BaseJoinToCreate(guildId, [channelId])];
        } else {
            const oldBaseJoinToCreate = data.find(x => x.guildId === guildId)
            var newBaseJoinToCreate = oldBaseJoinToCreate
                ? new BaseJoinToCreate(oldBaseJoinToCreate.guildId, oldBaseJoinToCreate.channelIds)
                : new BaseJoinToCreate(guildId, [])
            success = newBaseJoinToCreate.addChannel(channelId)

            if (oldBaseJoinToCreate && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseJoinToCreate)
            } else {
                // Otherwise add the new one
                data.push(newBaseJoinToCreate)
            }
        }

        await dataRepo.set('joinToCreate', data)
        return success
    }

    async removeChannel(guildId: string, channelId: string) {

        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`joinToCreate`)
        var success = false

        if (data) {
            const oldBaseJoinToCreate = data.find(x => x.guildId === guildId)
            var newBaseJoinToCreate = oldBaseJoinToCreate
                ? new BaseJoinToCreate(oldBaseJoinToCreate.guildId, oldBaseJoinToCreate.channelIds)
                : new BaseJoinToCreate(guildId, [])
            success = newBaseJoinToCreate.removeChannel(channelId)

            if (oldBaseJoinToCreate && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseJoinToCreate)
            } else {
                // Otherwise add the new one
                data.push(newBaseJoinToCreate)
            }
        }

        await dataRepo.set('joinToCreate', data)
        return success
    }
}