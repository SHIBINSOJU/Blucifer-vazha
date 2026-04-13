const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModLogger = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete_messages')
                .setDescription('Delete messages from the last X days')
                .setRequired(false)
                .addChoices(
                    { name: 'None', value: 0 },
                    { name: '1 day', value: 1 },
                    { name: '7 days', value: 7 }
                )),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_messages') || 1;

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({ content: 'You cannot ban me.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            const moderatorMember = interaction.guild.members.cache.get(interaction.user.id);
            if (member.roles.highest.position >= moderatorMember.roles.highest.position) {
                return interaction.reply({ content: 'You cannot ban a user with equal or higher role.', ephemeral: true });
            }

            if (!member.bannable) {
                return interaction.reply({ content: 'I cannot ban this user. Check my role position.', ephemeral: true });
            }
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 Banned')
                .setDescription(`You have been banned from **${interaction.guild.name}**`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

            await interaction.guild.members.ban(user.id, { reason, deleteMessageDays: deleteDays });

            await ModLogger.log(interaction.guild, 'BAN', {
                userId: user.id,
                moderatorId: interaction.user.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Failed to ban user:', err);
            interaction.reply({ content: 'Failed to ban user. Check my permissions.', ephemeral: true });
        }
    }
};
