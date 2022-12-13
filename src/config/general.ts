export const generalConfig: GeneralConfigType = {

	// do not touch that
    __templateVersion: '2.0.0',

	name: 'computronium', // the name of your bot
	description: 'General purpose bot for hades star communities', // the description of your bot
	defaultLocale: 'en', // default language of the bot, must be a valid locale
	simpleCommandsPrefix: '!', // default prefix for simple command messages (old way to do commands on discord)
	ownerId: process.env['BOT_OWNER_ID'] || '',
	timezone: 'Europe/Paris', // default TimeZone to well format and localize dates (logs, stats, etc)

	// useful links
	links: {
		invite: 'https://discord.com/api/oauth2/authorize?client_id=1048576181978542111&permissions=8&scope=bot',
		supportServer: 'https://discord.gg/5zdYh8D28n',
		gitRemoteRepo: 'https://github.com/barthofu/tscord',
	},
	
	automaticUploadImagesToImgur: false, // enable or not the automatic assets upload

	devs: [], // discord IDs of the devs that are working on the bot (you don't have to put the owner's id here)

	eval: {
		name: 'bot', // name to trigger the eval command
		onlyOwner: true // restrict the eval command to the owner only (if not, all the devs can trigger it)
	},

	// define the bot activities (phrases under its name). Types can be: PLAYING, LISTENING, WATCHING, STREAMING
    activities: [
		{
			text: 'Hades Star',
			type: 'PLAYING'
		}
	]

}

// global colors
export const colorsConfig = {

	primary: '#2F3136'
}
