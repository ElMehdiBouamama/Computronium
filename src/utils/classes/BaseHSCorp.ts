import { StarId } from "./BaseHSProfile";

export class BaseHSCorp implements IBaseHSCorp {
    name: string = "";
    members: ICorpMembers = new CorpMembers();
    creationDate: number = Date.now()
    description?: string = "";
    discordURL?: string = "";
    alliance?: string = "";
    emblem?: string = "";

    constructor(ownerStarId?: StarId, name?: string, discordURL?: string, alliance?: string, emblem?: string) {
        this.members.firstOfficer = ownerStarId ?? this.members.firstOfficer
        this.name = name ?? this.name
        this.discordURL = discordURL ?? this.discordURL
        this.alliance = alliance ?? this.alliance
        this.emblem = emblem ?? this.emblem
    }

    getOwnerAsString() {
        return this.members.firstOfficer.letters + "-" + this.members.firstOfficer.numbers.toString();
    }

    setOwner(starId: StarId) {
        this.members.firstOfficer = starId
    }

    isOwner(starId: StarId): boolean {
        return this.members.firstOfficer.equals(starId)
    }
}


export interface IBaseHSCorp {
    name: string;
    members: CorpMembers;
    creationDate: number;
    description?: string;
    discordURL?: string;
    alliance?: string;
    emblem?: string;
}

export class CorpMembers implements ICorpMembers {
    noRole: StarId[] = [];
    officers: StarId[] = [];
    firstOfficer: StarId = new StarId();

    constructor(ownerStarName?: StarId) {
        if (ownerStarName && !ownerStarName.isEmpty()) {
            this.firstOfficer = ownerStarName
        }
    }
}

export interface ICorpMembers {
    noRole: StarId[];
    officers: StarId[];
    firstOfficer: StarId;
}