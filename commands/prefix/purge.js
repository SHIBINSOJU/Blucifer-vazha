const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'purge',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('You need `Manage Messages` permission to use this command.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Please provide a number between 1 and 100. Usage: `!purge <amount>`');
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount + 1 });
            const deleted = await message.channel.bulkDelete(messages, true);

            await ModLogger.log(message.guild, 'PURGE', {
                channelId: message.channel.id,
                moderatorId: message.author.id,
                amount: deleted.size - 1
            });

            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle('🧹 Messages Purged')
                .setDescription(`Deleted ${deleted.size - 1} message(s)`)
                .setTimestamp();

            const reply = await message.channel.send({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 5000);

        } catch (err) {
            console.error('Failed to purge messages:', err);
            message.reply('Failed to purge messages. Messages older than 14 days cannot be bulk deleted.');
        }
    }
};
