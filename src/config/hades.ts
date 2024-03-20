import { Collection } from "discord.js";

export const hadesConfig = {
    techImage: {
        background: {
            src: "./assets/images/tech_background.png",
            width: 962,
            height: 962
        },
        spacing: {
            horizontal: 90,
            vertical: 70
        },
        lineElementsCount: 4,
        imgs: [
            {
                x: 550,
                y: 710,
                size: 150
            },
            {
                x: 660,
                y: 780,
                size: 98

            }
        ]
    }
}

export const hsCompendiumModules: IHSCompendiumModules[] = [
    {
        name: "Trade",
        coords: { x: 110, y: 85 },
        modules: new Collection([
            ['cargobay', 'Cargo Bay Extension'],
            ['computer', 'Shipment Computer'],
            ['tradeboost', 'Trade Boost'],
            ['rush', 'Rush'],
            ['tradeburst', 'Trade Burst'],
            ['shipdrone', 'Shipment Drone'],
            ['offload', 'Offload'],
            ['beam', 'Shipment Beam'],
            ['entrust', 'Entrust'],
            ['dispatch', 'Dispatch'],
            ['recall', 'Recall'],
            ['relicdrone', 'Relic Drone'],
        ])
    },
    {
        name: "Weapons",
        coords: { x: 110, y: 335 },
        modules: new Collection([
            ['battery', 'Battery'],
            ['laser', 'Laser'],
            ['mass', 'Mass Battery'],
            ['dual', 'Dual Laser'],
            ['barrage', 'Barrage'],
            ['dart', 'Dart Launcher']
        ])
    },
    {
        name: "Support",
        coords: { x: 110, y: 515 },
        modules: new Collection([
            ['emp', 'EMP'],
            ['teleport', 'Teleport'],
            ['rsextender', 'Red Star Life Extender'],
            ['repair', 'Remote Repair'],
            ['warp', 'Time Warp'],
            ['unity', 'Unity'],
            ['sanctuary', 'Sanctuary'],
            ['stealth', 'Stealth'],
            ['fortify', 'Fortify'],
            ['impulse', 'Impulse'],
            ['rocket', 'Alpha Rocket'],
            ['salvage', 'Salvage'],
            ['suppress', 'Suppress'],
            ['destiny', 'Destiny'],
            ['barrier', 'Barrier'],
            ['vengeance', 'Vengeance'],
            ['deltarocket', 'Delta Rocket'],
            ['leap', 'Leap'],
            ['bond', 'Bond'],
            ['laserturret', 'Laser Turret'],
            ['alphadrone', 'Alpha Drone'],
            ['omegarocket', 'Omega Rocket'],
            ['suspend', 'Suspend'],
            ['remotebomb', 'Remote Bomb']
        ])
    },
    {
        name: "Mining",
        coords: { x: 560, y: 85 },
        modules: new Collection([
            ['miningboost', 'Mining Boost'],
            ['hydrobay', 'Hydrogen Bay Extension'],
            ['enrich', 'Enrich'],
            ['remote', 'Remote Mining'],
            ['hydroupload', 'Hydrogen Upload'],
            ['miningunity', 'Mining Unity'],
            ['crunch', 'Crunch'],
            ['genesis', 'Genesis'],
            ['hydrorocket', 'Hydrogen Rocket'],
            ['minedrone', 'Mining Drone']
        ])
    },
    {
        name: "Shields",
        coords: { x: 560, y: 335 },
        modules: new Collection([
            ['alpha', 'Alpha Shield'],
            ['delta', 'Delta Shield'],
            ['passive', 'Passive Shield'],
            ['omega', 'Omega Shield'],
            ['mirror', 'Mirror Shield'],
            ['blast', 'Blast Shield'],
            ['area', 'Area Shield']
        ])
    },
    {
        name: "Ships",
        coords: { x: 560, y: 515 },
        modules: new Collection([
            ['bs', 'Battleship'],
            ['transp', 'Transport'],
            ['miner', 'Miner']
        ])
    }
]

export interface IHSCompendiumModules {
    name: string;
    coords: { x: number, y: number };
    modules: Collection<string, string>;
}

export interface ICompendiumAPIData {
    type: string;
    level: number;
    rs: number;
    ws: number;
}