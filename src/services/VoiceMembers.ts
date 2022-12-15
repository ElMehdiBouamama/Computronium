import { Store as RxStore } from "rxeta"
import { singleton } from "tsyringe"

interface voiceChannelMembers {
    voiceChannels: Map<string, Set<number>>
}

const initVoiceChannelMembers: voiceChannelMembers = {
    voiceChannels: new Map<string, Set<number>>()
}

@singleton()
export class voiceChannelMembersStore extends RxStore<voiceChannelMembers> {

    constructor() {
        super(initVoiceChannelMembers)
        //this.subscribe(x => console.log([...x.voiceChannels]));
    }

    add(voiceChannel: string, member: string) {
        let voiceChannels = this.get("voiceChannels")
        let members = this.getMembers(voiceChannel)
        if (!members) {
            members = new Set<number>()
        }
        members.add(parseInt(member))
        voiceChannels = voiceChannels.set(voiceChannel, members)
        this.update("voiceChannels", oldVoiceChannels => voiceChannels)
    }

    remove(voiceChannel: string, member: string) {
        let voiceChannels = this.get("voiceChannels")
        let members = this.getMembers(voiceChannel)
        if (members) {
            if (members.size <= 1) {
                voiceChannels.delete(voiceChannel)
            } else {
                members.delete(parseInt(member))
                voiceChannels = voiceChannels.set(voiceChannel, members)
            }
        }
        this.update("voiceChannels", oldVoiceChannels => voiceChannels)
    }

    getMembers(voiceChannel: string) {
        const voiceChannels = this.get("voiceChannels")
        return voiceChannels.get(voiceChannel)
    }

    isTemp(voiceChannelId: string): boolean {
        return this.get("voiceChannels").get(voiceChannelId) ? true:  false;
    }
}
