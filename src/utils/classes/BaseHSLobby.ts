export abstract class BaseHSLobby {
    guildId: string = ''
    APIKey: string = ''

    constructor(guildId: string, APIKey?: string) {
        this.guildId = guildId
        this.APIKey = APIKey ?? ''
    }

    clearKey() {
        this.APIKey = ''
        return true
    }
}