const { EmbedBuilder } = require('discord.js');
const { warnings, automodSettings } = require('../utils/database');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'warn',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need `Moderate Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to warn. Usage: `!warn @user [reason]`');
        }

        if (user.id === message.author.id) {
            return message.reply('You cannot warn yourself.');
        }

        if (user.id === message.client.user.id) {
            return message.reply('You cannot warn me.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (member && member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('You cannot warn a user with equal or higher role.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        warnings.add(message.guild.id, user.id, message.author.id, reason);
        const totalWarnings = warnings.getCount(message.guild.id, user.id);

        await ModLogger.log(message.guild, 'WARN', {
            userId: user.id,
            moderatorId: message.author.id,
            reason,
            totalWarnings
        });

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                { name: 'Reason', value: reason },
                { name: 'Total Warnings', value: `${totalWarnings}`, inline: true }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ Warning')
                .setDescription(`You have been warned in **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Total Warnings', value: `${totalWarnings}` }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (err) {
            console.log('Could not DM user');
        }
    }
};
