import { singleton } from "tsyringe";

import { Data } from "@entities";
import { Database } from "@services";
import { BaseTrackList } from "@utils/classes";

@singleton()
export class MusicService {

    constructor(
        private db: Database
    ) {
    }

    /**
     * Get reaction role messages from the "data" table.
     * @param guildId
     */
    async get(guildId: string): Promise<BaseTrackList> {

        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get(`trackList`)

        if (data) {
            const trackList = data.find(x => x.guildId === guildId)

            if (trackList) {
                return trackList
            }

        }
        return new BaseTrackList(guildId)
    }

    async getUser(guildId: string, userId: string): Promise<string[]> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get('trackList')

        if (data) {
            const trackList: BaseTrackList = data.find(dbEntry => dbEntry.guildId === guildId) ?? new BaseTrackList(guildId)

            if (trackList) {
                const userPlaylists = trackList.userTracks.get(userId)
                if (userPlaylists) {
                    return Object.keys(userPlaylists) ?? []
                }
            }
        }
        return []
    }

    async getPlaylist(guildId: string, userId: string, playlistName: string): Promise<string[] | undefined> {
        const dataRepo = this.db.get(Data)

        const data = await dataRepo.get('trackList')

        if (data) {
            const trackList: BaseTrackList = data.find(dbEntry => dbEntry.guildId === guildId) ?? new BaseTrackList(guildId)

            if (trackList) {
                const userPlaylists = trackList.userTracks.get(userId)
                if (userPlaylists) {
                    return userPlaylists.get(playlistName)
                }
            }
        }
        return undefined
    }

    async addTracks(guildId: string, userId: string, playlistName: string, tracks: string[]): Promise<boolean> {

        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`trackList`)

        var success = false

        if (!data) {

            data = [new BaseTrackList(guildId)]

        } else {

            const oldTrackList = data.find(x => x.guildId === guildId)

            var newTrackList = oldTrackList
                ? new BaseTrackList(oldTrackList.guildId, oldTrackList.userTracks)
                : new BaseTrackList(guildId)
            success = newTrackList.add(userId, playlistName, tracks)

            if (oldTrackList && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newTrackList)
            } else {
                // Otherwise add the new one
                data.push(newTrackList)
            }
        }

        await dataRepo.set('trackList', data)
        return success
    }

    async deleteTracks(guildId: string, userId: string, playlistName: string, tracks: string[]): Promise<boolean> {

        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`trackList`)

        var success = false

        if (!data) {

            data = [new BaseTrackList(guildId)]

        } else {

            const oldTrackList = data.find(x => x.guildId === guildId)

            var newTrackList = oldTrackList
                ? new BaseTrackList(oldTrackList.guildId, oldTrackList.userTracks)
                : new BaseTrackList(guildId)
            success = newTrackList.removeTracks(userId, playlistName, tracks)

            if (oldTrackList && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newTrackList)
            } else {
                // Otherwise add the new one
                data.push(newTrackList)
            }
        }

        await dataRepo.set('trackList', data)
        return success
    }

    async deleteUser(guildId: string, userId: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`trackList`)

        var success = false

        if (data) {
            const oldTrackList = data.find(x => x.guildId === guildId)
            var newTrackList = oldTrackList
                ? new BaseTrackList(oldTrackList.guildId, oldTrackList.userTracks)
                : new BaseTrackList(guildId)
            success = newTrackList.deleteUser(userId)

            if (oldTrackList && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newTrackList)
            } else {
                // Otherwise add the new one
                data.push(newTrackList)
            }
        }

        await dataRepo.set('trackList', data)
        return success
    }

    async clear(guildId: string): Promise<boolean> {
        const dataRepo = this.db.get(Data)

        var data = await dataRepo.get(`trackList`)

        var success = false

        if (data) {
            const oldTrackList = data.find(x => x.guildId === guildId)
            var newTrackList = oldTrackList
                ? new BaseTrackList(oldTrackList.guildId, oldTrackList.userTracks)
                : new BaseTrackList(guildId)
            success = newTrackList.clear()

            if (oldTrackList && success) {
                // Replace the old one
                data = data.map(x => x.guildId !== guildId ? x : newTrackList)
            } else {
                // Otherwise add the new one
                data.push(newTrackList)
            }
        }

        await dataRepo.set('trackList', data)

        return success
    }


}