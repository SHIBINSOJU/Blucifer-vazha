const { EmbedBuilder, version: discordVersion } = require('discord.js');
const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'info',
    async execute(message) {
        const client = message.client;
        const packageJson = this.getPackageJson();

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
                        `**Commands:** 15+`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💻 System',
                    value: [
                        `**Platform:** ${os.platform()}`,
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${discordVersion}`,
                        `**Memory:** ${this.formatMemory(process.memoryUsage().heapUsed)}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚡ Features',
                    value: [
                        '• Welcome Cards',
                        '• AutoMod System',
                        '• Moderation Tools',
                        '• Warning System'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },

    getPackageJson() {
        try {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const content = fs.readFileSync(packagePath, 'utf8');
            return JSON.parse(content);
        } catch {
            return null;
        }
    },

    formatMemory(bytes) {
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(2)} MB`;
    }
};
