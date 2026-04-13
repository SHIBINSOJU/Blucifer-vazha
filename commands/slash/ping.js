const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(getColor(latency))
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                { name: 'Status', value: getStatus(latency), inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};

function getColor(latency) {
    if (latency < 100) return 0x00FF00;
    if (latency < 200) return 0xFFFF00;
    return 0xFF0000;
}

function getStatus(latency) {
    if (latency < 100) return '🟢 Excellent';
    if (latency < 200) return '🟡 Good';
    if (latency < 500) return '🟠 Fair';
    return '🔴 Poor';
}
