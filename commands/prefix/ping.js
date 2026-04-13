const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    async execute(message) {
        const sent = await message.channel.send('🏓 Pinging...');
        
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(this.getColor(latency))
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                { name: 'Status', value: this.getStatus(latency), inline: true }
            )
            .setTimestamp();

        await sent.edit({ content: null, embeds: [embed] });
    },

    getColor(latency) {
        if (latency < 100) return 0x00FF00;
        if (latency < 200) return 0xFFFF00;
        return 0xFF0000;
    },

    getStatus(latency) {
        if (latency < 100) return '🟢 Excellent';
        if (latency < 200) return '🟡 Good';
        if (latency < 500) return '🟠 Fair';
        return '🔴 Poor';
    }
};
