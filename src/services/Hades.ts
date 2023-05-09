import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseHSAPI } from "@utils/classes";
import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Client } from "discordx";
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

    async generateTechEmbeds(techData: any, client: Client, interaction: CommandInteraction): Promise<EmbedBuilder[]> {
        await interaction.guild?.emojis.fetch()
        const chunkSize = 25;
        const list = techData.array;
        const embedArr: EmbedBuilder[] = [];
        for (let i = 0; i < list.length; i += chunkSize) {
            const chunk = list.slice(i, i + chunkSize);
            const embed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setAuthor({ name: interaction.user.tag, iconURL:  interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL})
                .setTitle("Tech Tree");
            for (const item of chunk) {
                try {
                    const emoji = client.emojis.cache.find(emoji => emoji.name == item.type);
                    embed.addFields({
                        name: emoji?.identifier ? `<:${emoji.identifier}>` : item.type,
                        value: `${item.level.toString()}`,
                        inline: true
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            embedArr.push(embed);
        }
        return embedArr;
    }
}