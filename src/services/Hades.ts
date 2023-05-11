import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseHSAPI } from "@utils/classes";
import { AttachmentBuilder, Colors, CommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js";
import { Client } from "discordx";
import request from 'request';
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { hadesConfig, hsCompendiumModules, IHSCompendiumModules } from "../config";

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

    async generateTechEmbeds(interaction: CommandInteraction, client: Client, techData: any, user: GuildMember): Promise<EmbedBuilder[]> {
        await interaction.guild?.emojis.fetch()
        const embedArr: EmbedBuilder[] = [];

        let modules = hsCompendiumModules as IHSCompendiumModules[]
        modules.forEach(category => {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setAuthor({
                    name: user.displayName,
                    iconURL: user.avatarURL() ?? user.displayAvatarURL()
                })
                .setTitle(category.name);

            for (const item of category.modules) {
                try {
                    const emoji = client.emojis.cache.find(emoji => emoji.name == item);
                    embed.addFields({
                        name: emoji?.identifier ? `<:${emoji.identifier}>` : item.toString(),
                        value: `${techData.map[item]?.level ?? "0"}`,
                        inline: true
                    });
                } catch (error) {
                    console.log(error);
                }
            }

            embedArr.push(embed);
        })

        return embedArr;
    }

    async generateTechImgData(techData: any): Promise<IHSCompendiumModules[]> {
        let modules = hsCompendiumModules as IHSCompendiumModules[]
        let techModsMap: Map<string, { level: number, rs: string, ws: string }> = techData.map
        modules.forEach(category => category.modules = category.modules.map(module => techModsMap[module]?.level ?? 0))
        return modules
    }

    async generateTechImage(interaction: CommandInteraction, techData: any, user: GuildMember): Promise<AttachmentBuilder> {
        const config = hadesConfig.techImage;
        const techLevels = await this.generateTechImgData(techData);
        const moduleBackground = await loadImage(config.background.src);
        const imgs = [
            user.avatarURL() ?? user.displayAvatarURL(),
            interaction.guild?.iconURL() ?? interaction.user.defaultAvatarURL
        ];
        const ign = "Rusty";
        const corp = "Trisolaris";

        // Create canvas
        const canvas = createCanvas(config.background.width, config.background.height);
        const ctx = canvas.getContext('2d');

        // Draw background image
        ctx.drawImage(moduleBackground, 0, 0, moduleBackground.width, moduleBackground.height);

        // Draw module levels
        ctx.font = "25pt Arial";
        ctx.fillStyle = "white";
        techLevels.forEach((category) => {
            for (let i = 0; i < category.modules?.length; i++) {
                ctx.fillText(
                    category.modules[i].toString(),
                    category.coords.x + config.spacing.horizontal * (i % config.lineElementsCount),
                    category.coords.y + config.spacing.vertical * Math.floor(i / config.lineElementsCount)
                );
            }
        });

        // Draw user and corp names
        ctx.font = "25pt Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${ign}`, 660, 610);
        ctx.fillText(`${corp}`, 660, 655);

        // Draw user and corp images
        for (let i = 0; i < config.imgs.length; i++) {
            const img = await loadImage(imgs[i]);
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                config.imgs[i].x + config.imgs[i].size / 2,
                config.imgs[i].y + config.imgs[i].size / 2,
                config.imgs[i].size / 2, 0, Math.PI * 2
            );
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(
                img,
                config.imgs[i].x,
                config.imgs[i].y,
                config.imgs[i].size,
                config.imgs[i].size
            );
            ctx.restore();
        }

        // Use the helpful Attachment class structure to process the file for you
        const encodedImage = await canvas.encode('png');
        const attachmentOptions = { name: `${user.displayName}_tech.png` };
        return new AttachmentBuilder(encodedImage, attachmentOptions);
    }
}