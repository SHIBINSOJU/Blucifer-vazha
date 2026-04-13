const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { warnings } = require('../../utils/database');
const ModLogger = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user for breaking rules')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'You cannot warn yourself.', ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({ content: 'You cannot warn me.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            const moderatorMember = interaction.guild.members.cache.get(interaction.user.id);
            if (member.roles.highest.position >= moderatorMember.roles.highest.position) {
                return interaction.reply({ content: 'You cannot warn a user with equal or higher role.', ephemeral: true });
            }
        }

        warnings.add(interaction.guild.id, user.id, interaction.user.id, reason);
        const totalWarnings = warnings.getCount(interaction.guild.id, user.id);

        await ModLogger.log(interaction.guild, 'WARN', {
            userId: user.id,
            moderatorId: interaction.user.id,
            reason,
            totalWarnings
        });

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason },
                { name: 'Total Warnings', value: `${totalWarnings}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ Warning')
                .setDescription(`You have been warned in **${interaction.guild.name}**`)
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
