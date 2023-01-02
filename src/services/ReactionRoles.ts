import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseReactionRole } from "@utils/classes";
import { Collection } from "discord.js";

@singleton()
export class ReactionRoleService {

    constructor(
        private db: Database
    ) {
    }

    /**
     * Get reaction role messages from the "data" table.
     * @param guildId
     */
    async get(guildId: string): Promise<BaseReactionRole> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`reactionRole`)

        if (data) {
            const guildReactionRoles = data.find(x => x.guildId === guildId)

            if (guildReactionRoles) {
                return guildReactionRoles
            }

        }
        return new BaseReactionRole(guildId)
    }

    async findChannelByMessageId(guildId: string, messageId: string): Promise<Collection<string, Collection<string, string>> | undefined> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get('reactionRole')

        if (data) {
            const reactionRole: BaseReactionRole = data.find(entry => entry.guildId === guildId) ?? new BaseReactionRole(guildId)

            if (reactionRole) {
                const found = reactionRole.channels.find(channel => channel.has(messageId))
                if (found) return found
            }
        }
        return undefined
    }

    async findMessageById(guildId: string, messageId: string): Promise<Collection<string, string> | undefined> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get('reactionRole')

        if (data) {
            const reactionRole = data.find(entry => entry.guildId === guildId)

            if (reactionRole) {
                const found = reactionRole.channels.find(channel => channel.has(messageId))?.get(messageId)
                if (found) return found
            }
        }
        return undefined
    }

    async findEmojiInMessage(guildId: string, messageId: string, emoji: string): Promise<Collection<string, string> | undefined> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get('reactionRole')

        if (data) {
            const reactionRole = data.find(entry => entry.guildId === guildId)

            if (reactionRole) {
                const found = reactionRole.channels.find(channel => channel.has(messageId))?.get(messageId)
                if (found) return found
            }
        }
        return undefined
    }

    async add(guildId: string, channelId: string, messageId: string, emojiId: string, roleId: string): Promise<boolean> {

        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`reactionRole`)

        var success = false

        if (!data) {

            data = [new BaseReactionRole(guildId)]

        } else {

            const oldBaseReactionRole = data.find(x => x.guildId === guildId)

            var newBaseReactionRole = oldBaseReactionRole
                ? new BaseReactionRole(oldBaseReactionRole.guildId, oldBaseReactionRole.channels)
                : new BaseReactionRole(guildId)


            success = newBaseReactionRole.add(channelId, messageId, emojiId, roleId)

            if (oldBaseReactionRole && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseReactionRole)
            } else {
                // Otherwise add the new one
                data.push(newBaseReactionRole)
            }
        }

        await dataRepo.set('reactionRole', data)
        return success
    }

    async deleteEmoji(guildId: string, channelId: string, messageId: string, emojiId: string): Promise<boolean> {

        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`reactionRole`)

        var success = false

        if (data) {
            const oldBaseReactionRole = data.find(x => x.guildId === guildId)
            var newBaseReactionRole = oldBaseReactionRole
                ? new BaseReactionRole(oldBaseReactionRole.guildId, oldBaseReactionRole.channels)
                : new BaseReactionRole(guildId)
            success = newBaseReactionRole.deleteEmoji(channelId, messageId, emojiId)

            if (oldBaseReactionRole && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseReactionRole)
            } else {
                // Otherwise add the new one
                data.push(newBaseReactionRole)
            }
        }

        await dataRepo.set('reactionRole', data)
        return success
    }

    async deleteMessage(guildId: string, messageId: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`reactionRole`)

        var success = false

        if (data) {
            const oldBaseReactionRole = data.find(x => x.guildId === guildId)
            var newBaseReactionRole = oldBaseReactionRole
                ? new BaseReactionRole(oldBaseReactionRole.guildId, oldBaseReactionRole.channels)
                : new BaseReactionRole(guildId)
            success = newBaseReactionRole.deleteMessage(messageId)

            if (oldBaseReactionRole && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseReactionRole)
            } else {
                // Otherwise add the new one
                data.push(newBaseReactionRole)
            }
        }

        await dataRepo.set('reactionRole', data)
        return success
    }

    async clear(guildId: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`reactionRole`)

        var success = false

        if (data) {
            const oldBaseReactionRole = data.find(x => x.guildId === guildId)
            var newBaseReactionRole = oldBaseReactionRole
                ? new BaseReactionRole(oldBaseReactionRole.guildId, oldBaseReactionRole.channels)
                : new BaseReactionRole(guildId)
            success = newBaseReactionRole.clear()

            if (oldBaseReactionRole && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newBaseReactionRole)
            } else {
                // Otherwise add the new one
                data.push(newBaseReactionRole)
            }
        }

        await dataRepo.set('reactionRole', data)

        return success
    }


}