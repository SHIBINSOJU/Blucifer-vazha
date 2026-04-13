const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'unmute',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need `Moderate Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to unmute. Usage: `!unmute @user [reason]`');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User is not in this server.');
        }

        const mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!mutedRole) {
            return message.reply('Muted role not found.');
        }

        if (!member.roles.cache.has(mutedRole.id)) {
            return message.reply(`${user.tag} is not muted.`);
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.roles.remove(mutedRole);

            await ModLogger.log(message.guild, 'UNMUTE', {
                userId: user.id,
                moderatorId: message.author.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 User Unmuted')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

            const dmEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Unmuted')
                .setDescription(`You have been unmuted in **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

        } catch (err) {
            console.error('Failed to unmute user:', err);
            message.reply('Failed to unmute user. Check my permissions.');
        }
    }
};
