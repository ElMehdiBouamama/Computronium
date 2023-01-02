import { Discord, On } from "@decorators";
import { Logger, ReactionRoleService } from "@services";
import chalk from "chalk";
import { ArgsOf } from "discordx";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export default class MessageReactionEvents {

    constructor(
        private service: ReactionRoleService,
        private logger: Logger
    ) {

    }

    // =============================
    // ========= Handlers ==========
    // =============================

    @On('messageReactionAdd')
    async onMessageReactionAdd([reaction, user]: ArgsOf<"messageReactionAdd">) {
        const guildId = reaction.message.guildId
        const messageId = reaction.message.id
        const member = await reaction.message.guild?.members.fetch(user.id)
        if (guildId && member) {
            // Get messages data from db
            const message = await this.service.findMessageById(guildId, messageId)
            if (message) {
                let roleId = undefined
                // There are stored reaction roles for this message ID that need to be processed
                if (message.has(encodeURIComponent(reaction.emoji.identifier))) {
                    roleId = message.get(encodeURIComponent(reaction.emoji.identifier)) ?? ''
                } else if (message.has(reaction.emoji.identifier)) {
                    roleId = message.get(reaction.emoji.identifier) ?? ''
                }
                if (roleId && !member.roles.cache.has(roleId)) {
                    await member.roles.add(roleId)
                    const role = reaction.message.guild?.roles.cache.get(roleId)
                    this.logger.log(`(REACTION_ROLES_USER_UPDATE) "${chalk.visible.greenBright('added role')}" ${chalk.dim.italic.gray('role ')} ${chalk.hex(role?.hexColor ?? '0x0f0')?.(role?.name)} ${chalk.dim.italic.gray('to user')} ${chalk.bold.blue(member.user.tag)}`, "info", true)
                }
            }
        }
        // Either interaction was not performed by a guild member or not in a guild
        return
    }

    @On('messageReactionRemove')
    async onMessageReactionRemove([reaction, user]: ArgsOf<"messageReactionRemove">) {
        const guildId = reaction.message.guildId
        const messageId = reaction.message.id
        const member = await reaction.message.guild?.members.fetch(user.id)
        if (guildId && member) {
            // Get messages data from db
            const message = await this.service.findMessageById(guildId, messageId)
            if (message) {
                let roleId = undefined
                // There are stored reaction roles for this message ID that need to be processed
                if (message.has(encodeURIComponent(reaction.emoji.identifier))) {
                    roleId = message.get(encodeURIComponent(reaction.emoji.identifier)) ?? ''
                } else if (message.has(reaction.emoji.identifier)) {
                    roleId = message.get(reaction.emoji.identifier) ?? ''
                }
                if (roleId && member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId)
                    const role = reaction.message.guild?.roles.cache.get(roleId)
                    this.logger.log(`(REACTION_ROLES_USER_UPDATE) "${chalk.visible.greenBright('remove role')}" ${chalk.dim.italic.gray('role ')} ${chalk.hex(role?.hexColor ?? '0x0f0')?.(role?.name)} ${chalk.dim.italic.gray('to user')} ${chalk.bold.blue(member.user.tag)}`, "info", true)
                }
            }
        }
        // Either interaction was not performed by a guild member or not in a guild
        return
    }
}