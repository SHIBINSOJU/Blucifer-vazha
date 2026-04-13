const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    async execute(message, args) {
        const prefix = '!';
        
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const commandHelp = this.getCommandHelp(commandName);
            
            if (commandHelp) {
                const embed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle(`📖 Help: ${commandName}`)
                    .setDescription(commandHelp.description)
                    .addFields(
                        { name: 'Usage', value: `\`${commandHelp.usage}\`` },
                        { name: 'Permission', value: commandHelp.permission || 'None' }
                    )
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            } else {
                return message.reply(`Command "${commandName}" not found. Use \`${prefix}help\` to see all commands.`);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('📚 Blucifer Bot Commands')
            .setDescription(`Prefix: \`${prefix}\` | Use \`${prefix}help <command>\` for detailed info`)
            .addFields(
                {
                    name: '🛠️ General',
                    value: '`help`, `ping`, `uptime`, `info`',
                    inline: false
                },
                {
                    name: '👋 Welcome',
                    value: '`testwelcome`',
                    inline: false
                },
                {
                    name: '🛡️ Moderation',
                    value: '`warn`, `warnings`, `unwarn`, `mute`, `unmute`, `kick`, `ban`, `unban`, `purge`',
                    inline: false
                },
                {
                    name: '🤖 AutoMod',
                    value: '`automod`',
                    inline: false
                },
                {
                    name: '💬 Utility',
                    value: '`say`',
                    inline: false
                }
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },

    getCommandHelp(commandName) {
        const helpData = {
            'help': {
                description: 'Shows the help menu or detailed info about a specific command.',
                usage: '!help [command]',
                permission: 'None'
            },
            'ping': {
                description: 'Check the bot\'s latency and API response time.',
                usage: '!ping',
                permission: 'None'
            },
            'uptime': {
                description: 'Shows how long the bot has been running.',
                usage: '!uptime',
                permission: 'None'
            },
            'info': {
                description: 'Displays information about the bot.',
                usage: '!info',
                permission: 'None'
            },
            'testwelcome': {
                description: 'Test the welcome card generation.',
                usage: '!testwelcome',
                permission: 'Manage Server'
            },
            'warn': {
                description: 'Warn a user for breaking rules.',
                usage: '!warn @user [reason]',
                permission: 'Moderate Members'
            },
            'warnings': {
                description: 'View warnings for a user.',
                usage: '!warnings [@user]',
                permission: 'Moderate Members'
            },
            'unwarn': {
                description: 'Remove a warning or clear all warnings from a user.',
                usage: '!unwarn @user [warning_id]',
                permission: 'Moderate Members'
            },
            'mute': {
                description: 'Mute a user for a specified duration.',
                usage: '!mute @user [duration] [reason]',
                permission: 'Moderate Members'
            },
            'unmute': {
                description: 'Unmute a muted user.',
                usage: '!unmute @user [reason]',
                permission: 'Moderate Members'
            },
            'kick': {
                description: 'Kick a user from the server.',
                usage: '!kick @user [reason]',
                permission: 'Kick Members'
            },
            'ban': {
                description: 'Ban a user from the server.',
                usage: '!ban @user [reason]',
                permission: 'Ban Members'
            },
            'unban': {
                description: 'Unban a user by their ID.',
                usage: '!unban <user_id> [reason]',
                permission: 'Ban Members'
            },
            'purge': {
                description: 'Delete a number of messages (1-100).',
                usage: '!purge <amount>',
                permission: 'Manage Messages'
            },
            'automod': {
                description: 'Configure AutoMod settings.',
                usage: '!automod <status/setup/toggle/set/words/ignore>',
                permission: 'Administrator'
            },
            'say': {
                description: 'Make the bot say a message.',
                usage: '!say <message>',
                permission: 'Specific Role'
            }
        };

        return helpData[commandName] || null;
    }
};
