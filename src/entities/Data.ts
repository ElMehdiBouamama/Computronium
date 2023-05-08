import { Entity, EntityRepositoryType, PrimaryKey, Property } from "@mikro-orm/core"
import { EntityRepository } from "@mikro-orm/sqlite"
import { BaseJoinToCreate, BaseReactionRole, BaseTrackList, BaseHSAPI, BaseRSConfig } from "@utils/classes"
import { Collection } from "discord.js"
import { CustomBaseEntity } from "./BaseEntity"

/**
 * Default data for the Data table (dynamic EAV key/value pattern) 
 */
export const defaultData = {

    maintenance: false,
    lastMaintenance: Date.now(),
    lastStartup: Date.now(),
    joinToCreate: [] as BaseJoinToCreate[],
    reactionRole: [] as BaseReactionRole[],
    trackList: [] as BaseTrackList[],
    hsAPIKey: [] as BaseHSAPI[],
    hsRSConfig: [] as BaseRSConfig[]
}

type DataType = keyof typeof defaultData

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ customRepository: () => DataRepository })
export class Data extends CustomBaseEntity {

    [EntityRepositoryType]?: DataRepository

    @PrimaryKey()
    key!: string

    @Property()
    value: string = ''
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class DataRepository extends EntityRepository<Data> {

    async get<T extends DataType>(key: T): Promise<typeof defaultData[T]> {

        const data = await this.findOne({ key })

        return JSON.parse(data!.value, this.reviver)
    }

    async set<T extends DataType>(key: T, value: typeof defaultData[T]): Promise<void> {

        const data = await this.findOne({ key })

        if (!data) {

            const newData = new Data()
            newData.key = key
            newData.value = JSON.stringify(value, this.replacer)

            await this.persistAndFlush(newData)
        }
        else {
            data.value = JSON.stringify(value, this.replacer)
            await this.flush()
        }
    }

    async add<T extends DataType>(key: T, value: typeof defaultData[T]): Promise<void> {

        const data = await this.findOne({ key })

        if (!data) {

            const newData = new Data()
            newData.key = key
            newData.value = JSON.stringify(value, this.replacer)

            await this.persistAndFlush(newData)
        }
    }

    private replacer(key: any, value: any) {
        const collectionToObject = (m: any) => {
            let lo: any = {}
            for (let [k, v] of m) {
                if (v instanceof Collection) {
                    lo[k] = collectionToObject(v)
                }
                else {
                    lo[k] = v
                }
            }
            return lo
        }
        const collectionKeys = Object.keys(value).filter(key => value[key] instanceof Collection)
        for (let key of collectionKeys) {
            value[key] = {
                dataType: 'Collection',
                value: collectionToObject(value[key]),
            }
        }
        return value
    }

    private reviver(key: any, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Collection') {
                const objectToCollection = (o: any) => {
                    let m = new Collection()
                    for (let k of Object.keys(o)) {
                        if (o[k] instanceof Object) {
                            m.set(k, objectToCollection(o[k]))
                        }
                        else {
                            m.set(k, o[k])
                        }
                    }
                    return m
                }
                return objectToCollection(value.value)
            }
        }
        return value;
    }
}