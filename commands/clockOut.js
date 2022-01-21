const dutyClockDB = require('../dutyClockDB');
const messageHandle = require('../messageHandler');


module.exports = {
	name: 'clockout',
	description: 'Force removes a user from the Duty Clock database.',
	permission: [
		{
			id: '749280137173925911', // Server Staff
			type: 'ROLE',
			permission: true,
		},
		{
			id: '826538019712532490', // IT
			type: 'ROLE',
			permission: true,
		},
		{
			id: '749280136590786561', // @everyone in Law Discord
			type: 'ROLE',
			permission: false,
		},
	],
	options: [
		{
			name: 'hex',
			description: 'Steam Hex ID',
			type: 'STRING',
			required: true,
		},
	],
	async execute(interaction) {
		const hex = interaction.options.getString('hex');
		const user = interaction.member.user.username;
		const now = Math.floor(new Date().getTime() / 1000.0);
		const time = `<t:${now}:t>`;
		const hexInfoOjb = await dutyClockDB.getInfoFromHex(hex);
		if (hexInfoOjb !== null) {
			const clockInTime = await hexInfoOjb.clockInTime;
			const charName = await hexInfoOjb.charName;
			const jobRole = await hexInfoOjb.jobRole;
			const clockAction = 'off';
			const dutytime = (Math.round((now - clockInTime) / 60));
			text = `:red_circle: \`${charName}\` clocked \`${clockAction}\` from \`${jobRole}\` at ${time} with Hex ID \`${hex}\`.`;
			text2 = `:red_circle: \`${charName}\` clocked off at ${time}. They clocked on at <t:${clockInTime}:t> and were clocked in for \`${dutytime}\` minutes.`;
			await dutyClockDB.clockOutUpdate(hex, charName, jobRole, now);
			if (jobRole === 'POLICE') {
				await interaction.client.channels.cache.get('925843917558124644').send(text2); // Sends message to PD log channel for HR
			}
			else if (jobRole === 'DOC') {
				await interaction.client.channels.cache.get('925843974860722196').send(text2); // Sends message to DOC log channel for HR
			}
			else if (jobRole === 'EMS') {
				await interaction.client.channels.cache.get('927830297834319942').send(text2); // Sends message to EMS log channel for HR
			}
			else {
				await interaction.client.channels.cache.get('923065033053855744').send(':bangbang: Help I\'ve fallen and can\'t get up. :(');
			}
			await interaction.client.channels.cache.get('923065033053855744').send(text); // Sends message to all logs channel
			const clockList = await dutyClockDB.clockOut(hex);
			await messageHandle.clockMessage(interaction.client, clockList);
			text3 = `\`${hex}\` was force clocked off by \`${user}\` at ${time}.`;
			await interaction.reply(text3);
		}
		else {
			interaction.reply(`Hex ID \`${hex}\` is not clocked in right now.`);
		}
	},
};