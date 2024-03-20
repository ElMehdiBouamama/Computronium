import { Collection } from "discord.js"

export class BaseTrackList {

    guildId: string = ''
    // UserID -> PlayList Name -> URIs
    userTracks: Collection<string, Collection<string, string[]>> = new Collection()

    constructor(guildId: string, userTracks?: Collection<string, Collection<string, string[]>>) {
        this.guildId = guildId
        this.userTracks = userTracks ?? new Collection()
    }

    add(userId: string, playlistName: string, tracks: string[]) {
        var user = this.getCollectionValue(this.userTracks, userId)
        if (user) {
            user.set(playlistName, tracks)
            return true
        }
        return false
    }

    removeTracks(userId: string, playlistName: string, tracks: string[]): boolean {
        var user = this.getCollectionValue(this.userTracks, userId)
        if (user) {
            if (user.has(playlistName)) {
                let storedTracks: string[] = user.get(playlistName)
                const oldStoredTracksLength = storedTracks.length
                storedTracks = storedTracks.filter(track => !tracks.includes(track))
                if (storedTracks.length != oldStoredTracksLength) {
                    user.set(playlistName, storedTracks)
                    return true
                }
            }
        }
        return false
    }

    deletePlaylist(userId: string, playlistName: string): boolean {
        var user = this.getCollectionValue(this.userTracks, userId)
        if (user) {
            if (user.has(playlistName)) {
                user.delete(playlistName)
                return true
            }
        }
        return false
    }

    deleteUser(userId: string): boolean {
        const userExists = this.userTracks.has(userId)
        if (userExists) {
            this.userTracks.delete(userId)
        }
        return true
    }

    clear(): boolean {
        this.userTracks = new Collection()
        return true
    }

    private getCollectionValue(map: Collection<string, any>, value: string): Collection<string, any> {
        if (!map.has(value)) {
            map.set(value, new Collection())
        }
        return map.get(value)
    }
}