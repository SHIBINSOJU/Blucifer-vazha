const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'ban',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('You need `Ban Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to ban. Usage: `!ban @user [reason]`');
        }

        if (user.id === message.author.id) {
            return message.reply('You cannot ban yourself.');
        }

        if (user.id === message.client.user.id) {
            return message.reply('You cannot ban me.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (member) {
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('You cannot ban a user with equal or higher role.');
            }

            if (!member.bannable) {
                return message.reply('I cannot ban this user. Check my role position.');
            }
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 Banned')
                .setDescription(`You have been banned from **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

            await message.guild.members.ban(user.id, { reason, deleteMessageDays: 1 });

            await ModLogger.log(message.guild, 'BAN', {
                userId: user.id,
                moderatorId: message.author.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Failed to ban user:', err);
            message.reply('Failed to ban user. Check my permissions.');
        }
    }
};
