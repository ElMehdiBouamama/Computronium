export class BaseJoinToCreate {

    guildId: string = ''
    channelIds: string[] = []

    constructor(guildId: string, channelIds: string[]) {
        this.guildId = guildId
        this.channelIds = channelIds
    }

    addChannel(channelId: string): boolean {
        const channelExists = this.channelIds.includes(channelId)
        if (!channelExists) {
            this.channelIds.push(channelId)
        }
        return true
    }

    removeChannel(channelId: string): boolean {
        const channelExists = this.channelIds.includes(channelId)
        if (channelExists) {
            this.channelIds = this.channelIds.filter(x => x !== channelId)
        }
        return true
    }
        
    clearChannels(): boolean {
        this.channelIds = [];
        return true
    }
}