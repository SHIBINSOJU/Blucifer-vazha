const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { warnings } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check (defaults to yourself)')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const userWarnings = warnings.get(interaction.guild.id, user.id);

        if (userWarnings.length === 0) {
            return interaction.reply({ 
                content: `${user.id === interaction.user.id ? 'You have' : `${user.tag} has`} no warnings.`,
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(`Total: ${userWarnings.length} warning(s)`)
            .setTimestamp();

        const recentWarnings = userWarnings.slice(0, 10);
        for (const warn of recentWarnings) {
            const moderator = interaction.guild.members.cache.get(warn.moderator_id);
            const date = new Date(warn.created_at * 1000).toLocaleDateString();
            
            embed.addFields({
                name: `Warning #${warn.id} - ${date}`,
                value: `**Moderator:** ${moderator ? moderator.user.tag : 'Unknown'}\n**Reason:** ${warn.reason || 'No reason'}`,
                inline: false
            });
        }

        if (userWarnings.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${userWarnings.length} warnings` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
