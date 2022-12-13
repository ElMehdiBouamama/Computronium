import { ArgsOf } from "discordx";
import { container, injectable } from "tsyringe";

import { Discord, Guard, On } from "@decorators";
import { JoinToCreate, voiceChannelMembersStore } from "@services";
import { BaseJoinToCreate } from "@utils/classes";

@Discord()
@injectable()
export default class JoinToCreateUpdateEvent {

    constructor(private jtcService: JoinToCreate) {

    }

    // =============================
    // ========= Handlers ==========
    // =============================

    @On('voiceStateUpdate')
    @Guard()
    async voiceStateHandler(
        [leftState, joinedState]: ArgsOf<"voiceStateUpdate">
    ) {
        // Get the Join To Create Data from the database as well as the voice channel members from the store
        var jtcDB: BaseJoinToCreate = await this.jtcService.getGuildChannels(joinedState.guild.id)
        const store = container.resolve(voiceChannelMembersStore)

        if (joinedState.channel && joinedState.member) {
            const memberId = joinedState.member.id;
            const channelId = joinedState.channel.id;
            if (channelId && memberId) {
                // Check if the joined voice channel is registered in the database
                if (jtcDB.channelIds.includes(channelId)) {
                    // Create a temporary channel
                    const tempChannel = await joinedState.channel.clone({ name: `${joinedState.member?.displayName}'s Channel` })
                    // Move the member to the new channel
                    joinedState.member?.voice.setChannel(tempChannel)
                    store.add(tempChannel.id, memberId)
                } else if (store.isTemp(channelId)) {
                    // Check if the joined voice channel is a temp channel
                    store.add(channelId, memberId)
                }
            }
        }

        if (leftState.channel && leftState.member) {
            const channelId = leftState.channel.id;
            const memberId = leftState.member.id;
            // Check if a valid user left a temp channel
            if (channelId && memberId && store.isTemp(channelId)) {
                if (leftState.channel.members.size !== 0 && store.getMembers(channelId) == null) {
                    await leftState.channel.delete("Temp channel: Empty");
                }
                store.remove(channelId, memberId) 
                console.log(store.getMembers(channelId))
            }
        }
    }
}