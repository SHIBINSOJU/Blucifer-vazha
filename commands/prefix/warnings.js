const { EmbedBuilder } = require('discord.js');
const { warnings } = require('../utils/database');

module.exports = {
    name: 'warnings',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need `Moderate Members` permission to use this command.');
        }

        const user = message.mentions.users.first() || message.author;
        const userWarnings = warnings.get(message.guild.id, user.id);

        if (userWarnings.length === 0) {
            return message.reply(`${user.id === message.author.id ? 'You have' : `${user.tag} has`} no warnings.`);
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(`Total: ${userWarnings.length} warning(s)`)
            .setTimestamp();

        const recentWarnings = userWarnings.slice(0, 10);
        for (const warn of recentWarnings) {
            const moderator = message.guild.members.cache.get(warn.moderator_id);
            const date = new Date(warn.created_at * 1000).toLocaleDateString();
            
            embed.addFields({
                name: `Warning #${warn.id} - ${date}`,
                value: `**Moderator:** ${moderator ? moderator.user.tag : 'Unknown'}\n**Reason:** ${warn.reason || 'No reason'}`,
                inline: false
            });
        }

        if (userWarnings.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${userWarnings.length} warnings` });
        }

        await message.channel.send({ embeds: [embed] });
    }
};
