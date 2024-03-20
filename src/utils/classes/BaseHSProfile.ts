import { BaseHSCorp, IBaseHSCorp } from "./BaseHSCorp";

export class BaseHSProfile implements IBaseHSProfile {
    initialized: boolean = false
    userId: string;
    ign: string;
    starId: StarId = new StarId();
    corp?: BaseHSCorp = new BaseHSCorp();
    tz?: number = 0;
    rsMods: Set<string> = new Set<string>();

    constructor(userId: string, ign: string, starId: StarId) {
        this.userId = userId
        this.ign = ign
        this.starId.letters = starId.letters
        this.starId.numbers = starId.numbers
        this.initialized = true
    }
}

export interface IBaseHSProfile {
    initialized: boolean;
    userId: string;
    ign: string;
    starId: StarId;
    corp?: IBaseHSCorp;
    tz?: number;
    rsMods?: Set<string>;
}

export class StarId implements IStarId {
    letters: string = "";
    numbers: number = 0;

    constructor(starId?: string | string[]) {
        if (starId && StarId.isValid(starId)) {
            if (starId === starId+'') {
                starId = starId.split("-")
            }
            this.letters = starId[0]
            this.numbers = parseInt(starId[1])
        }
    }

    toString(): string {
        return `${this.letters}-${this.numbers.toString()}`
    }

    isEmpty(): boolean {
        return this.letters === "" || this.numbers === 0
    }

    equals(id: StarId): boolean {
        return this.letters === id.letters && this.numbers === id.numbers
    }

    static isValid(id: string | string[]): boolean {
        if (id === id+'') id = id.split("-")
        if (id.length !== 2) return false
        else if (id[0].length != 3 || id[0].match('\D{3}')) return false
        else if (id[1].length != 4 || id[1].match('\d{4}')) return false
        else return true
    }
}

export interface IStarId {
    letters: string;
    numbers: number;

    toString(): string;
    isEmpty(): boolean;
    equals(id: StarId ): boolean;
}