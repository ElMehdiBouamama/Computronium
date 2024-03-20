import { Data } from '@entities';
import { Database } from '@services';
import { BaseHSCorp, BaseHSProfile, StarId } from '@utils/classes';
import { Colors, EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { singleton } from "tsyringe";

@singleton()
export class ProfileService {

    constructor(private db: Database) { }

    async getMemberProfile(memberId: string): Promise<BaseHSProfile | undefined> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`hsProfile`)

        if (data) {
            const userHsProfile = data.find(x => x.userId === memberId)

            if (userHsProfile) {
                return userHsProfile
            }

        }
        return undefined
    }

    async setMemberProfile(memberId: string, ign: string, starId: StarId): Promise<boolean> {
        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsProfile`)
        var success = false

        if (!data) {
            data = [new BaseHSProfile(memberId, ign, starId)]
        } else {
            const oldBaseHSProfile = data.find(x => x.userId === memberId)
            var newBaseHSProfile = oldBaseHSProfile
                ? new BaseHSProfile(oldBaseHSProfile.userId, oldBaseHSProfile.ign, oldBaseHSProfile.starId)
                : new BaseHSProfile(memberId, ign, starId)
            success = true

            if (oldBaseHSProfile && success) {
                // Replace the old one
                data = data.map(x => x.userId !== memberId ? x : newBaseHSProfile)
            } else {
                // Otherwise add the new one
                data.push(newBaseHSProfile)
            }
        }

        await dataRepo.set('hsProfile', data)
        return success
    }

    async updateUserCorp(starId: StarId, corp: BaseHSCorp): Promise<boolean> {
        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsProfile`)
        var success = false

        if (!data) {
            data = []
        } else {
            const userHsProfile = data.find(x => x.starId.letters === starId.letters && x.starId.numbers === starId.numbers)

            if (userHsProfile) {
                userHsProfile.corp = new BaseHSCorp(starId, corp.name, corp.discordURL, corp.alliance, corp.emblem)
            }
            success = true

            if (userHsProfile && success) {
                // Replace the old one
                data = data.map(x => x.userId !== userHsProfile.userId ? x : userHsProfile)
            }
        }

        await dataRepo.set('hsProfile', data)
        return success
    }

    async addUserRSMods(starId: StarId, rsMods: string[] | string | null): Promise<Set<string> | undefined> {
        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsProfile`)
        var result: Set<string> | undefined = undefined

        if (!data) {
            data = []
        } else {
            const userHsProfile = data.find(x => x.starId.letters === starId.letters && x.starId.numbers === starId.numbers)

            if (userHsProfile) {
                userHsProfile.rsMods = new Set(userHsProfile.rsMods)
                if (rsMods instanceof Array) userHsProfile.rsMods = new Set([...userHsProfile.rsMods, ...rsMods])
                else if (rsMods) userHsProfile.rsMods.add(rsMods)
                else userHsProfile.rsMods = new Set<string>()
                result = userHsProfile.rsMods
            }

            if (userHsProfile && result instanceof Set) {
                // Replace the old one
                data = data.map(x => x.userId !== userHsProfile.userId ? x : userHsProfile)
            }
        }

        await dataRepo.set('hsProfile', data)
        return result
    }

    async removeUserRSMods(starId: StarId, rsMods: Array<string> | string | null): Promise<Set<string> | undefined> {
        const dataRepo = this.db.get(Data)
        var data = await dataRepo.get(`hsProfile`)
        var result: Set<string> | undefined = undefined

        if (!data) {
            data = []
        } else {
            const userHsProfile = data.find(x => x.starId.letters === starId.letters && x.starId.numbers === starId.numbers)

            if (userHsProfile) {
                userHsProfile.rsMods = new Set(userHsProfile.rsMods)
                if (rsMods instanceof Array) userHsProfile.rsMods = new Set([...userHsProfile.rsMods].filter(mod => !rsMods.includes(mod)))
                else if (rsMods) userHsProfile.rsMods.delete(rsMods)
                else userHsProfile.rsMods = new Set<string>()
                result = userHsProfile.rsMods
            }

            if (userHsProfile && result instanceof Set) {
                // Replace the old one
                data = data.map(x => x.userId !== userHsProfile.userId ? x : userHsProfile)
            }
        }

        await dataRepo.set('hsProfile', data)
        return result
    }

    async findUserByStarId(starId: StarId): Promise<BaseHSProfile | undefined> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`hsProfile`)

        if (data) {
            const userHsProfile = data.find(x => x.starId.letters === starId.letters && x.starId.numbers === starId.numbers)

            if (userHsProfile) {
                return userHsProfile
            }

        }
        return undefined
    }

    generateProfileEmbed(profile: BaseHSProfile, displayName: string) {
        const embed = new EmbedBuilder()
            .setTitle(`:dove: **${displayName}**'s Profile :dove:`)
            .setDescription(`.★.─────────────\nCustomize your profile by using:\n:arrow_right: **/hades corp join** to join an existing corp.\n:arrow_right: **/hades corp create** to create a new corp.\n:arrow_right: **/hades rsmods** to show other users which mods you're using in the red star.\n─────────────.★.`)
            .setColor(Colors.Gold)
            .addFields(
                {
                    name: `:video_game: IGN`,
                    value: `**${profile.ign}**`,
                    inline: true
                },
                {
                    name: `<:ys:1042533726187425872> Star ID`,
                    value: `**${profile.starId.letters}-${profile.starId.numbers.toString()}**`,
                    inline: true
                },
                {
                    name: `:homes: Corporation`,
                    value: `**${profile.corp?.name != "" ? profile.corp?.name : "Not setup"}**`,
                    inline: true
                },
                {
                    name: `<:rs:1042533659326021662> RS modules`,
                    value: `**${'' + [...profile.rsMods]?.length ?? '0'} in use**`,
                    inline: true
                },
                {
                    name: `:clock3: Time zone`,
                    value: `**${profile.tz != 0 ? profile.tz : 'Not setup'}**`,
                    inline: true
                }
            )
        return embed
    }

    async generateCorpEmbed(userProfile: BaseHSProfile) {
        let FOProfile: BaseHSProfile | undefined = undefined;

        if (userProfile.corp?.members.firstOfficer)
            FOProfile = await this.findUserByStarId(userProfile.corp?.members.firstOfficer)

        const embed = new EmbedBuilder()
            .setTitle(`:crossed_swords: Corp profile :crossed_swords:`)
            .setDescription(
                `.★.─────────────\nCustomize your corp profile by using:\n:arrow_right: **/hades corp description** to join an existing corp.\n:arrow_right: **/hades corp alliance** to specify corp alliance.\n:arrow_right: **/hades corp discord** to add an invite link to your own discord server.\n:arrow_right: **/hades corp emblem** to customize your corp emblem.\n─────────────.★.\n${userProfile.corp?.description ?? "No corp description provided"}`)
            .setColor(Colors.DarkGold)
            .addFields(
                {
                    name: `:video_game: Name`,
                    value: `**${userProfile.corp?.name}**`,
                    inline: true
                },
                {
                    name: `:crown: First Officer`,
                    value: `**${FOProfile ? FOProfile.ign : 'Not setup'}**`,
                    inline: true
                },
                {
                    name: `:homes: Alliance`,
                    value: `**${userProfile.corp?.alliance != "" ? userProfile.corp?.alliance : "Not setup"}**`,
                    inline: true
                },
                {
                    name: `:link: discord URL`,
                    value: `**${userProfile.corp?.discordURL != "" ? userProfile.corp?.discordURL : "No link"} **`,
                    inline: true
                }
            )
        return embed
    }

    generateRSModsEmbed(client: Client, rsMods: Set<string>): EmbedBuilder {


        const embed = new EmbedBuilder()
            .setTitle("Red Star Modules Configuration")
            .setColor(Colors.DarkRed);

        const description = ([...rsMods].map(mod => {
            const emoji = client.emojis.cache.find(emoji => emoji.name == mod)
            return `${ emoji ?? mod }`
        }))
        embed.setDescription(description.join('\t'))

        //const fields = ([...rsMods].map(mod => {
        //    const emoji = client.emojis.cache.find(emoji => emoji.name == mod)
        //    const field = {
        //        name: `${emoji ?? mod}`,
        //        value: ` `,
        //        inline: true
        //    }
        //    return field
        //}))

        //embed.addFields(...fields)
        return embed
    }
}