const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'kick',
    async execute(message, args) {
        if (!message.member.permissions.has('KickMembers')) {
            return message.reply('You need `Kick Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to kick. Usage: `!kick @user [reason]`');
        }

        if (user.id === message.author.id) {
            return message.reply('You cannot kick yourself.');
        }

        if (user.id === message.client.user.id) {
            return message.reply('You cannot kick me.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User is not in this server.');
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('You cannot kick a user with equal or higher role.');
        }

        if (!member.kickable) {
            return message.reply('I cannot kick this user. Check my role position.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('👢 Kicked')
                .setDescription(`You have been kicked from **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

            await member.kick(reason);

            await ModLogger.log(message.guild, 'KICK', {
                userId: user.id,
                moderatorId: message.author.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Failed to kick user:', err);
            message.reply('Failed to kick user. Check my permissions.');
        }
    }
};
