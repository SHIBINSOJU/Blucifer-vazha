const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const ModLogger = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');

        const channel = interaction.channel;

        try {
            let messages = await channel.messages.fetch({ limit: amount + 1 });
            
            if (user) {
                messages = messages.filter(m => m.author.id === user.id);
            }

            const deleted = await channel.bulkDelete(messages, true);

            await ModLogger.log(interaction.guild, 'PURGE', {
                channelId: channel.id,
                moderatorId: interaction.user.id,
                amount: deleted.size - 1
            });

            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle('🧹 Messages Purged')
                .setDescription(`Deleted ${deleted.size - 1} message(s)${user ? ` from ${user.tag}` : ''}`)
                .setTimestamp();

            const reply = await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (err) {
            console.error('Failed to purge messages:', err);
            interaction.reply({ 
                content: 'Failed to purge messages. Messages older than 14 days cannot be bulk deleted.',
                ephemeral: true 
            });
        }
    }
};
