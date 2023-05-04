import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseHSAPI } from "@utils/classes";
import request from 'request';

@singleton()
export class HadesService {


    constructor(private db: Database) {
    }

    private async requestDataFromAPI(userid: string, apikey: string): Promise<any> {
        const options = {
            method: 'GET',
            url: 'https://bot.hs-compendium.com/compendium/api/tech',
            qs: { token: apikey, userid: userid },
            headers: { 'Content-Type': 'application/json' }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        const jsonBody = JSON.parse(body);
                        resolve(jsonBody);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * Get reaction role messages from the "data" table.
     * @param guildId
     */
    async get(guildId: string, userId: string): Promise<any> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`hsAPIKey`)

        if (data) {
            const guildData = data.find(x => x.guildId === guildId)

            if (guildData) {
                return await this.requestDataFromAPI(userId, guildData.APIKey)
            }

        }
        return undefined
    }

    async add(guildId: string, apiKey: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsAPIKey`)
        var success = false
        if (!data) {
            data = [new BaseHSAPI(guildId, apiKey)]
        } else {
            const oldBaseHSAPI = data.find(x => x.guildId === guildId)
            var newBaseHSAPI = oldBaseHSAPI
                ? new BaseHSAPI(oldBaseHSAPI.guildId, oldBaseHSAPI.APIKey)
                : new BaseHSAPI(guildId)
            newBaseHSAPI.APIKey = apiKey
            success = (newBaseHSAPI.APIKey === apiKey)
            if (oldBaseHSAPI && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseHSAPI)
            } else {
                // Otherwise add the new one
                data.push(newBaseHSAPI)
            }
        }
        await dataRepo.set('hsAPIKey', data)
        return success
    }

    async clear(guildId: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`hsAPIKey`)

        var success = false

        if (data) {
            const oldBaseHSAPI = data.find(x => x.guildId === guildId)
            var newBaseHSAPI = oldBaseHSAPI
                ? new BaseHSAPI(oldBaseHSAPI.guildId, oldBaseHSAPI.APIKey)
                : new BaseHSAPI(guildId)
            success = newBaseHSAPI.clearKey()

            if (oldBaseHSAPI && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseHSAPI)
            } else {
                // Otherwise add the new one
                data.push(newBaseHSAPI)
            }
        }

        await dataRepo.set('hsAPIKey', data)
        return success
    }
}