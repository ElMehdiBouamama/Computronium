import { Store as RxStore } from "rxeta"
import { singleton } from "tsyringe"

interface voiceChannelMembers {
    voiceChannels: Map<string, Set<string>>
}

const initVoiceChannelMembers: voiceChannelMembers = {
    voiceChannels: new Map<string, Set<string>>()
}

@singleton()
export class voiceChannelMembersStore extends RxStore<voiceChannelMembers> {

    constructor() {
        super(initVoiceChannelMembers)
        //this.subscribe(x => console.log([...x.voiceChannels]));
    }

    add(voiceChannelId: string, member: string) {
        let voiceChannels = this.get("voiceChannels")
        let members = this.getMembers(voiceChannelId)
        if (!members) {
            members = new Set<string>()
        }
        members.add(member)
        voiceChannels = voiceChannels.set(voiceChannelId, members)
        this.update("voiceChannels", oldVoiceChannels => voiceChannels)
    }

    remove(voiceChannelId: string, member: string) {
        let voiceChannels = this.get("voiceChannels")
        let members = this.getMembers(voiceChannelId)
        if (members) {
            if (members.size <= 1) {
                voiceChannels.delete(voiceChannelId)
            } else {
                members.delete(member)
                voiceChannels = voiceChannels.set(voiceChannelId, members)
            }
        }
        this.update("voiceChannels", oldVoiceChannels => voiceChannels)
    }

    getMembers(voiceChannelId: string) {
        const voiceChannels = this.get("voiceChannels")
        return voiceChannels.get(voiceChannelId)
    }

    isTemp(voiceChannelId: string): boolean {
        return this.getMembers(voiceChannelId) ? true: false;
    }
}
