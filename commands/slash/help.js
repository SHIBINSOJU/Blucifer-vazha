const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show bot commands and information')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get detailed info about a specific command')
                .setRequired(false)
                .addChoices(
                    { name: 'ping', value: 'ping' },
                    { name: 'info', value: 'info' },
                    { name: 'warn', value: 'warn' },
                    { name: 'mute', value: 'mute' },
                    { name: 'kick', value: 'kick' },
                    { name: 'ban', value: 'ban' },
                    { name: 'purge', value: 'purge' }
                )),

    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        
        if (commandName) {
            const commandHelp = getCommandHelp(commandName);
            if (commandHelp) {
                const embed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle(`📖 Help: /${commandName}`)
                    .setDescription(commandHelp.description)
                    .addFields(
                        { name: 'Usage', value: commandHelp.usage },
                        { name: 'Permission', value: commandHelp.permission || 'None' }
                    )
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('📚 Blucifer Bot Commands')
            .setDescription('Use `/help <command>` for detailed information')
            .addFields(
                {
                    name: '🛠️ General',
                    value: '`/help`, `/ping`, `/info`',
                    inline: false
                },
                {
                    name: '🛡️ Moderation',
                    value: '`/warn`, `/warnings`, `/mute`, `/kick`, `/ban`, `/purge`',
                    inline: false
                },
                {
                    name: '💬 Note',
                    value: 'Prefix commands (like `!help`) are also available. Use `!` as the prefix.',
                    inline: false
                }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

function getCommandHelp(commandName) {
    const helpData = {
        'ping': {
            description: 'Check the bot\'s latency and API response time.',
            usage: '/ping',
            permission: 'None'
        },
        'info': {
            description: 'Displays information about the bot.',
            usage: '/info',
            permission: 'None'
        },
        'warn': {
            description: 'Warn a user for breaking rules.',
            usage: '/warn @user [reason]',
            permission: 'Moderate Members'
        },
        'mute': {
            description: 'Mute a user for a specified duration.',
            usage: '/mute @user [duration] [reason]',
            permission: 'Moderate Members'
        },
        'kick': {
            description: 'Kick a user from the server.',
            usage: '/kick @user [reason]',
            permission: 'Kick Members'
        },
        'ban': {
            description: 'Ban a user from the server.',
            usage: '/ban @user [reason]',
            permission: 'Ban Members'
        },
        'purge': {
            description: 'Delete a number of messages (1-100).',
            usage: '/purge <amount>',
            permission: 'Manage Messages'
        }
    };

    return helpData[commandName] || null;
}
