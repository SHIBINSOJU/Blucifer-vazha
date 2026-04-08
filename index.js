require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===== READY =====
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

// ===== LOAD EVENTS =====
require('./events/guildMemberAdd')(client);

// ===== COMMAND HANDLER =====
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (cmd === 'say') {
        const command = require('./commands/say');
        command.execute(message, args);
    }
    if (cmd === 'testwelcome') {
    const command = require('./commands/testwelcome');
    command.execute(message);
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
