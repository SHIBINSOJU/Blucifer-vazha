const { EmbedBuilder } = require('discord.js');
const { warnings } = require('../utils/database');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'unwarn',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need `Moderate Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user. Usage: `!unwarn @user [warning_id]`');
        }

        const warningId = args[1] ? parseInt(args[1]) : null;
        
        if (warningId) {
            const userWarnings = warnings.get(message.guild.id, user.id);
            const warning = userWarnings.find(w => w.id === warningId);
            
            if (!warning) {
                return message.reply(`Warning #${warningId} not found for this user.`);
            }

            warnings.remove(warningId);
            const remainingWarnings = warnings.getCount(message.guild.id, user.id);

            await ModLogger.log(message.guild, 'UNWARN', {
                userId: user.id,
                moderatorId: message.author.id,
                remainingWarnings
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Warning Removed')
                .setDescription(`Removed warning #${warningId} from ${user.tag}`)
                .addFields(
                    { name: 'Remaining Warnings', value: `${remainingWarnings}`, inline: true }
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        } else {
            const userWarnings = warnings.get(message.guild.id, user.id);
            const clearedCount = userWarnings.length;

            if (clearedCount === 0) {
                return message.reply(`${user.tag} has no warnings to clear.`);
            }

            warnings.clear(message.guild.id, user.id);

            await ModLogger.log(message.guild, 'CLEARWARNS', {
                userId: user.id,
                moderatorId: message.author.id,
                clearedCount
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🗑️ Warnings Cleared')
                .setDescription(`Cleared all ${clearedCount} warning(s) from ${user.tag}`)
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }
    }
};
