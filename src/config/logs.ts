export const logsConfig: LogsConfigType = {

    debug: false, // set the discordx client debug logs
	
    // for each type of log, you can precise :
    // - if the log should be consoled
    // - if the log should be saved to the log files
    // - if the log should be sent to a discord channel (providing its IP)

    interaction: {
        file: true,
        console: true,
        channel: "1037789153473073243",

        // exclude some interactions types
        exclude: [
            'BUTTON_INTERACTION', 
            'STRING_SELECT_MENU_INTERACTION'
        ]
    },

    simpleCommand: {
        file: true,
        console: true,
        channel: null
    },

    newUser: {
        file: true,
        console: true,
        channel: "1037789153473073243"
    },

    guild: {
        file: true,
        console: true,
        channel: "1037789153473073243"
    },
    
    error: {
        file: true,
        console: true,
        channel: null
    }
}