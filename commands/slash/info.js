const { SlashCommandBuilder, EmbedBuilder, version: discordVersion } = require('discord.js');
const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Show bot information and statistics'),

    async execute(interaction) {
        const client = interaction.client;
        const packageJson = getPackageJson();

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🤖 Bot Information')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '📋 General',
                    value: [
                        `**Name:** ${client.user.username}`,
                        `**ID:** ${client.user.id}`,
                        `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`,
                        `**Version:** ${packageJson?.version || '1.0.0'}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 Statistics',
                    value: [
                        `**Servers:** ${client.guilds.cache.size}`,
                        `**Users:** ${client.users.cache.size}`,
                        `**Channels:** ${client.channels.cache.size}`,
                        `**Commands:** ${client.slashCommands.size} slash + 15 prefix`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💻 System',
                    value: [
                        `**Platform:** ${os.platform()}`,
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${discordVersion}`,
                        `**Memory:** ${formatMemory(process.memoryUsage().heapUsed)}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚡ Features',
                    value: [
                        '• Welcome Cards',
                        '• AutoMod System',
                        '• Moderation Tools',
                        '• Warning System',
                        '• Slash Commands'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

function getPackageJson() {
    try {
        const packagePath = path.join(__dirname, '..', '..', 'package.json');
        const content = fs.readFileSync(packagePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

function formatMemory(bytes) {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
}
