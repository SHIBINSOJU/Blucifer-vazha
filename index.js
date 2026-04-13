require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const AutoModHandler = require('./utils/automodHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});

// ===== SLASH COMMANDS COLLECTION =====
client.slashCommands = new Collection();

// ===== LOAD SLASH COMMANDS =====
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const filePath = path.join(slashCommandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.slashCommands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing required properties.`);
    }
}

// ===== READY =====
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    console.log(`Loaded in ${client.guilds.cache.size} server(s)`);
    console.log(`Loaded ${client.slashCommands.size} slash command(s)`);
});

// ===== LOAD EVENTS =====
require('./events/guildMemberAdd')(client);

// ===== SLASH COMMAND HANDLER =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMessage = 'There was an error executing this command!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// ===== PREFIX COMMAND HANDLER =====
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // AutoMod Check
    await AutoModHandler.handleMessage(message);

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const commands = {
        'help': './commands/prefix/help',
        'ping': './commands/prefix/ping',
        'uptime': './commands/prefix/uptime',
        'info': './commands/prefix/info',
        'say': './commands/prefix/say',
        'testwelcome': './commands/prefix/testwelcome',
        'warn': './commands/prefix/warn',
        'warnings': './commands/prefix/warnings',
        'unwarn': './commands/prefix/unwarn',
        'mute': './commands/prefix/mute',
        'unmute': './commands/prefix/unmute',
        'kick': './commands/prefix/kick',
        'ban': './commands/prefix/ban',
        'unban': './commands/prefix/unban',
        'purge': './commands/prefix/purge',
        'automod': './commands/prefix/automod'
    };

    if (commands[cmd]) {
        try {
            const command = require(commands[cmd]);
            await command.execute(message, args);
        } catch (err) {
            console.error(`Error executing command ${cmd}:`, err);
            message.reply('An error occurred while executing this command.').catch(() => {});
        }
    }
});

// ===== ERROR HANDLING =====
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
