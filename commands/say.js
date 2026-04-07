require('dotenv').config();

module.exports = {
    name: 'say',
    async execute(message, args) {

        // Ignore bots
        if (message.author.bot) return;

        // Role check
        if (!message.member.roles.cache.has(process.env.SAY_ROLE_ID)) {
            return message.reply('You are not allowed to use this command.');
        }

        const text = args.join(' ');
        if (!text) return;

        // Delete original
        await message.delete().catch(() => {});

        // Send message
        message.channel.send(text);
    }
};
