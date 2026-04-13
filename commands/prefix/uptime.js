const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    async execute(message) {
        const uptime = message.client.uptime;
        const formatted = this.formatUptime(uptime);

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('⏱️ Bot Uptime')
            .setDescription(`I've been running for:\n\n**${formatted}**`)
            .addFields(
                { name: 'Started', value: `<t:${Math.floor((Date.now() - uptime) / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
        if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
        if (seconds % 60 > 0 && days === 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

        return parts.join(', ') || 'Just started';
    }
};
