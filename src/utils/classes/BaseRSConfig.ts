export class BaseRSConfig {

    userId: string = ''
    configs: IRSConfig = new IRSConfig()
    initialized: boolean = false

    constructor(userId: string, configs?: IRSConfig) {
        this.userId = userId
        this.configs = configs ?? new IRSConfig()
    }

    addUserConfigs(rsConfigs: IRSConfig): boolean {
        this.configs = rsConfigs
        this.initialized = true
        return true
    }

    clearUserConfigs() {
        this.configs = new IRSConfig()
        return true
    }
}

export class IRSConfig {
    joinExistingRS: boolean

    constructor(joinExistingRS?: boolean) {
        this.joinExistingRS = joinExistingRS ?? false
    }

}