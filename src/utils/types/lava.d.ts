type LavaConfigType = {
    host: {
        address: string,
        port: number,
    },
    password: string,
    shardCount: number, // the total number of shards that your bot is running (optional, useful if you're load balancing)
    userId: string, // the user id of your bot
}