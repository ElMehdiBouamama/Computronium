import { Collection } from "discord.js"

export class BaseReactionRole {

    guildId: string
    // ChannelId -> MessageId -> (emoji, role)
    channels: Collection<string, Collection<string, Collection<string, string>>> = new Collection()

    constructor(guildId: string, channels?: Collection<string, Collection<string, Collection<string, string>>>) {
        this.guildId = guildId
        this.channels = channels ?? new Collection()
    }

    add(channelId: string, messageId: string, emojiId: string, roleId: string) {
        // Get the channel by it's ID or create it if it doesn't exist
        var channel = this.getCollectionValue(this.channels, channelId)
        if (channel) {
            // get the message from the channel by it's ID or create it if it doesn't exist
            var message = this.getCollectionValue(channel, messageId)
            if (message) {
                message.set(emojiId, roleId)
                return true
            }
        }
        return false
    }

    deleteEmoji(channelId: string, messageId: string, emojiId: string) {
        var success = false
        var channel = this.getCollectionValue(this.channels, channelId)
        if (channel) {
            var message = this.getCollectionValue(channel, messageId)
            if (message) {
                success = message.delete(emojiId)
            }
        }
        return success
    }

    deleteMessage(messageId: string) {
        const channel = this.channels.find(channel => channel.has(messageId))
        if (channel) {
            return channel.delete(messageId)
        }
        return false
    }

    clear() {
        this.channels = new Collection()
        return true
    }

    list() {
    }

    private getCollectionValue(map: Collection<string, any>, value: string): Collection<string, any> {
        if (!map.has(value)) {
            map.set(value, new Collection())
        }
        return map.get(value)
    }
}