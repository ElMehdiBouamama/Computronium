import { User } from "discord.js";
import { singleton } from "tsyringe";

@singleton()
export class RSQueueService {

    async createRSQueue(rslevel: number, user: User): Promise<boolean> {
        console.log(`${typeof (rslevel)} :  ${rslevel}`)
        console.log(`User : ${user}`)



        return true
    }

}