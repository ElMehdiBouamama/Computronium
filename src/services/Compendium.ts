import { hadesConfig, hsCompendiumModules, ICompendiumAPIData, IHSCompendiumModules } from "@config";
import { Data } from "@entities";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { Database } from "@services";
import { BaseHSAPI } from "@utils/classes";
import { deepCopy, resolveEmoji, simpleErrorEmbed } from "@utils/functions";
import { AttachmentBuilder, Colors, CommandInteraction, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { Client } from "discordx";
import request from 'request';
import { singleton } from "tsyringe";

@singleton()
export class CompendiumService {


    constructor(private db: Database) {
    }

    private async requestDataFromAPI(userid: string, apikey: string): Promise<any> {
        const options = {
            method: 'GET',
            url: 'https://bot.hs-compendium.com/compendium/api/tech',
            qs: { token: apikey, userid: userid },
            headers: { 'Content-Type': 'application/json' }
        };
        return await new Promise((resolve, reject) => {
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
     * Validate techData received from the API
     * @param guildId
     */
    async validate(techData, interaction: CommandInteraction) {
        let isValid = false
        if (techData === undefined) {
            simpleErrorEmbed(interaction, "Configure the hs compendium APIkey with **/hades apikey set** before using the bot")
        }
        else if (!techData) {
            simpleErrorEmbed(interaction, `Use **%transferdata** to load data into the server first`)
        }
        else if (techData.type == 2) {
            simpleErrorEmbed(interaction, 'Download hs compendium on your mobile phone, then use %connect to connect HS compendium app to your discord')
        }
        else if (techData.type == 3) {
            simpleErrorEmbed(interaction, 'You have no tech records, use %connect to load your data')
        }
        else if (techData.type == 4) {
            simpleErrorEmbed(interaction, 'The hades compendium api key is incorrect or expired please contact your server admins if you are a member and use **/hades apikey set** if you are a server admin')
        }
        else if (techData.array?.length == 0 || techData.map?.size == 0) {
            simpleErrorEmbed(interaction, 'You have to link your hades compendium app first before proceeding, use **%transferdata** to load your data from another server or **%connect** to connect your HS compendium app with the hs compendium discord bot')
        } else {
            isValid = true
        }
        return isValid
    }

    /**
     * Get the HS compendium API key from the "data" table.
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

    async getKey(guildId: string): Promise<string> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`hsAPIKey`)

        if (data) {
            const guildData = data.find(x => x.guildId === guildId)
            return guildData?.APIKey ?? "null"
        }
        return "null"
    }

    async setKey(guildId: string, apiKey: string): Promise<boolean> {
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
            success = newBaseHSAPI.clearKey()
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

    async clearKey(guildId: string): Promise<boolean> {
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

    async generateTechEmbeds(interaction: CommandInteraction, client: Client, techData: ICompendiumAPIData[], user: AllGuildMemberTypes): Promise<EmbedBuilder[]> {
        const embedArr: EmbedBuilder[] = [];
        let modules = deepCopy(hsCompendiumModules) as IHSCompendiumModules[];

        modules.forEach(category => {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setAuthor({
                    name: (user as GuildMember).displayName,
                    iconURL: (user as GuildMember).avatarURL() ?? (user as GuildMember).displayAvatarURL()
                })
                .setTitle(category.name);

            for (const [modID, modName] of category.modules) {

                try {
                    const emoji = resolveEmoji(interaction, modID)
                    embed.addFields({
                        name: emoji?.identifier ? `<:${emoji.identifier}>` : modName,
                        value: `${techData?.map[modID]?.level ?? "0"}`,
                        inline: true
                    });
                } catch (error) {
                    console.error(error)
                }
            }

            embedArr.push(embed);
        })

        return embedArr;
    }

    async generateTechSelectMenu(interaction: CommandInteraction, client: Client, techData: ICompendiumAPIData[], type: string = `add`): Promise<{ title: string, menuItem: StringSelectMenuBuilder }[]> {
        const result: { title: string, menuItem: StringSelectMenuBuilder }[] = [];
        let modules = deepCopy(hsCompendiumModules).slice(1, 5) as IHSCompendiumModules[];
        const unlockedTech: string[] = techData.filter(mod => mod.level !== 0).map(mod => mod.type)

        modules.forEach(category => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`${type}-rsmodules-menu`)
                .setPlaceholder(`${category.name} modules`);
            if (category.name == "Weapons" || category.name == "Shields") selectMenu.setMaxValues(3)


            for (const [modID, modName] of category.modules) {
                if (unlockedTech.includes(modID)) {
                    const moduleOption = new StringSelectMenuOptionBuilder().setLabel(modName).setValue(modID)
                    const emoji = resolveEmoji(interaction, modID)
                    if (emoji && emoji.identifier) moduleOption.setEmoji(emoji.identifier)
                    selectMenu.addOptions(moduleOption)
                }
            }
            result.push({ title: category.name, menuItem: selectMenu })
        })

        return result
    }


    async generateTechImgData(techData: any): Promise<IHSCompendiumModules[]> {
        // Deep copy / clone is needed here to make sure modules and hsCompendiumModules are two different objects²
        let modules = deepCopy(hsCompendiumModules) as IHSCompendiumModules[]
        let techModsMap: Map<string, { level: number, rs: string, ws: string }> = techData.map

        modules.forEach(category =>
            category.modules = category.modules.mapValues(
                (moduleName, moduleId, collection) => techModsMap[moduleId]?.level?.toString() ?? "0"
            )
        )

        return modules
    }

    async generateTechImage(interaction: CommandInteraction, techData: ICompendiumAPIData[], user: GuildMember): Promise<AttachmentBuilder> {
        const config = hadesConfig.techImage;
        const techLevels = await this.generateTechImgData(techData);

        const moduleBackground = await loadImage(config.background.src);
        const imgs = [
            user.avatarURL() ?? user.displayAvatarURL(),
            interaction.guild?.iconURL() ?? interaction.user.defaultAvatarURL
        ];
        const ign = user.displayName;
        const corp = interaction.guild?.name ?? 'No corp';

        // Create canvas
        const canvas = createCanvas(config.background.width, config.background.height);
        const ctx = canvas.getContext('2d');

        // Draw background image
        ctx.drawImage(moduleBackground, 0, 0, moduleBackground.width, moduleBackground.height);

        // Draw module levels
        ctx.font = "25pt Arial";
        ctx.fillStyle = "white";
        techLevels.forEach(category => {
            for (let i = 0; i < category.modules?.size; i++) {
                ctx.fillText(
                    category.modules.at(i) as string,
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
