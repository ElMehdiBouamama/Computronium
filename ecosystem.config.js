module.exports = {
    "apps": [
        {
            "name": "lavalink",
            "script": "./run.js",
            "args": "lavalink",
            instances: 1,
            exec_mode: 'cluster'
        },
        {
            "name": "bot",
            "script": "./run.js",
            "args": "bot dev",
            restart_delay: 3000,
            instances: 1, 
            exec_mode: 'cluster',
        }
    ]
};