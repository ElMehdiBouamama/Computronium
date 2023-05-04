import { ArgsOf, Guard } from "discordx";
import { container, injectable } from "tsyringe";

import { Discord, On } from "@decorators";
import { JoinToCreate, voiceChannelMembersStore } from "@services";
import { BaseJoinToCreate } from "@utils/classes";
import { NotBot } from "@guards";

@Discord()
@injectable()
export default class JoinToCreateUpdateEvent {

    constructor(private jtcService: JoinToCreate) {

    }

    // =============================
    // ========= Handlers ==========
    // =============================

    @On('voiceStateUpdate')
    @Guard(NotBot)
    async voiceStateHandler(
        [leftState, joinedState]: ArgsOf<"voiceStateUpdate">
    ) {
        const jtcDB: BaseJoinToCreate = await this.jtcService.getGuildChannels(joinedState.guild.id);
        const store = container.resolve(voiceChannelMembersStore);

        if (joinedState.channel && joinedState.member) {
            const memberId = joinedState.member.id;
            const channelId = joinedState.channelId;

            if (channelId && memberId) {
                if (jtcDB.channelIds.includes(channelId)) {
                    const tempChannel = await joinedState.channel.clone({ name: `${joinedState.member.displayName}'s Channel` });
                    joinedState.member.voice.setChannel(tempChannel);
                    store.add(tempChannel.id, memberId);
                } else if (store.isTemp(channelId)) {
                    store.add(channelId, memberId);
                }
            }
        }

        if (leftState.channel && leftState.member) {
            const memberId = leftState.member.id;
            const channelId = leftState.channelId;

            if (channelId && memberId && store.isTemp(channelId) && store.getMembers(channelId)?.has(memberId)) {
                store.remove(channelId, memberId);
                if (store.getMembers(channelId) == null) {
                    await leftState.channel.delete("Temp channel: Empty");
                }
            }
        }
    }
}