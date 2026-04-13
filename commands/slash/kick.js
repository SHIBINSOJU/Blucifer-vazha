const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModLogger = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({ content: 'You cannot kick me.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({ content: 'User is not in this server.', ephemeral: true });
        }

        const moderatorMember = interaction.guild.members.cache.get(interaction.user.id);
        if (member.roles.highest.position >= moderatorMember.roles.highest.position) {
            return interaction.reply({ content: 'You cannot kick a user with equal or higher role.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: 'I cannot kick this user. Check my role position.', ephemeral: true });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('👢 Kicked')
                .setDescription(`You have been kicked from **${interaction.guild.name}**`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

            await member.kick(reason);

            await ModLogger.log(interaction.guild, 'KICK', {
                userId: user.id,
                moderatorId: interaction.user.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Failed to kick user:', err);
            interaction.reply({ content: 'Failed to kick user. Check my permissions.', ephemeral: true });
        }
    }
};
