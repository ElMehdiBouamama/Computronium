import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseRSConfig, IRSConfig } from "@utils/classes";

@singleton()
export class RedStar {

    constructor( private db: Database ) { }

    /**
     * Get join to create voice channels from the "data" table.
     * @param guildId
     */
    async getUserConfigs(userId: string): Promise<BaseRSConfig> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`hsRSConfig`)

        if (data) {
            const rsConfigs = data.find(x => x.userId === userId)

            if (rsConfigs) {
                return rsConfigs
            }

        }
        return new BaseRSConfig(userId)
    }

    async addUserConfigsl(userId: string, configs: IRSConfig) {

        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsRSConfig`)
        var success = false

        if (!data) {
            data = [new BaseRSConfig(userId, configs)];
        } else {
            const oldBaseRSConfig = data.find(x => x.userId === userId)
            var newBaseRSConfig = oldBaseRSConfig
                ? new BaseRSConfig(oldBaseRSConfig.userId, oldBaseRSConfig.configs)
                : new BaseRSConfig(userId)
            success = newBaseRSConfig.addUserConfigs(configs)

            if (oldBaseRSConfig && success) {
                // Replace the old one
                data = data.map(x => x.userId !== userId ? x : newBaseRSConfig)
            } else {
                // Otherwise add the new one
                data.push(newBaseRSConfig)
            }
        }

        await dataRepo.set('hsRSConfig', data)
        return success
    }

    async removeConfigs(userId: string) {

        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsRSConfig`)
        var success = false

        if (data) {
            const oldBaseRSConfig = data.find(x => x.userId === userId)
            var newBaseRSConfig = oldBaseRSConfig
                ? new BaseRSConfig(oldBaseRSConfig.userId, oldBaseRSConfig.configs)
                : new BaseRSConfig(userId)
            success = newBaseRSConfig.clearUserConfigs()

            if (oldBaseRSConfig && success) {
                // Replace the old one
                data = data.map(x => x.userId !== userId ? x : newBaseRSConfig)
            } else {
                // Otherwise add the new one
                data.push(newBaseRSConfig)
            }
        }

        await dataRepo.set('hsRSConfig', data)
        return success
    }
}