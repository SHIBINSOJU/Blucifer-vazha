const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'unban',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('You need `Ban Members` permission to use this command.');
        }

        const userId = args[0];
        if (!userId) {
            return message.reply('Please provide a user ID to unban. Usage: `!unban <user_id> [reason]`');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return message.reply('This user is not banned.');
            }

            await message.guild.members.unban(userId, reason);

            await ModLogger.log(message.guild, 'UNBAN', {
                userId: userId,
                moderatorId: message.author.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔓 User Unbanned')
                .addFields(
                    { name: 'User ID', value: userId, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Failed to unban user:', err);
            message.reply('Failed to unban user. Check the user ID and my permissions.');
        }
    }
};
