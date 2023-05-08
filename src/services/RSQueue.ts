import { User } from "discord.js";
import { injectable, singleton } from "tsyringe";
import { RedStar } from "./RedStar";

@singleton()
@injectable()
export class RSQueueService {

    constructor(private service: RedStar) { }

    async createRSQueue(rslevel: number, user: User): Promise<boolean> {
        console.log(`${typeof (rslevel)} :  ${rslevel}`)
        console.log(`User : ${user}`)

        return true
    }

    async userConfigExists(user: User): Promise<boolean> {
        if (!user) return false
        let userConfig = await this.getUserRSConfig(user)
        return userConfig.initialized;
    }

    async setUserRSConfig(user: User) {

    }

    async getUserRSConfig(user: User) {
        let userConfig = await this.service.getUserConfigs(user.id)
        return userConfig
    }

}