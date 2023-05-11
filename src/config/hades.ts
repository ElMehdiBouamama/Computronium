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
        modules: [
            "cargobay", "computer", "tradeboost", "rush",
            "tradeburst", "shipdrone", "offload", "beam",
            "entrust", "recall", "dispatch", "relicdrone"
        ],
    },
    {
        name: "Weapons",
        coords: { x: 110, y: 335 },
        modules: [
            "battery", "laser", "mass", "dual",
            "barrage", "dart"
        ],
    },
    {
        name: "Support",
        coords: { x: 110, y: 515 },
        modules: [
            "emp", "teleport", "rsextender", "repair",
            "warp", "unity", "sanctuary", "stealth",
            "fortify", "impulse", "rocket", "salvage",
            "suppress", "destiny", "barrier", "vengeance",
            "deltarocket", "leap", "bond", "alphadrone",
            "omegarocket", "suspend", "remotebomb", "laserturret"],
    },
    {
        name: "Mining",
        coords: { x: 560, y: 85 },
        modules: [
            "miningboost", "hydrobay", "enrich", "remote",
            "hydroupload", "miningunity", "crunch", "genesis",
            "minedrone", "hydrorocket"
        ],

    },
    {
        name: "Shields",
        coords: { x: 560, y: 335 },
        modules: [
            "alpha", "delta", "passive", "omega",
            "mirror", "blast", "area"
        ],
    },
    {
        name: "Ships",
        coords: { x: 560, y: 515 },
        modules: ["bs", "transp", "miner"]

    }
]

export interface IHSCompendiumModules {
    name: string;
    coords: { x: number, y: number };
    modules: string[] | number[];
}