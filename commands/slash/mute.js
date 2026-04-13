const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModLogger = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Mute duration (e.g., 10m, 1h, 1d)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const durationInput = interaction.options.getString('duration') || '10m';
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: 'You cannot mute yourself.', ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({ content: 'You cannot mute me.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({ content: 'User is not in this server.', ephemeral: true });
        }

        const moderatorMember = interaction.guild.members.cache.get(interaction.user.id);
        if (member.roles.highest.position >= moderatorMember.roles.highest.position) {
            return interaction.reply({ content: 'You cannot mute a user with equal or higher role.', ephemeral: true });
        }

        const durationMs = parseDuration(durationInput);
        const durationText = formatDuration(durationMs);

        const mutedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!mutedRole) {
            return interaction.reply({ content: 'Muted role not found. Please create a role named "Muted".', ephemeral: true });
        }

        try {
            await member.roles.add(mutedRole);

            await ModLogger.log(interaction.guild, 'MUTE', {
                userId: user.id,
                moderatorId: interaction.user.id,
                duration: durationText,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF8C00)
                .setTitle('🔇 User Muted')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Duration', value: durationText, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            setTimeout(async () => {
                try {
                    const currentMember = await interaction.guild.members.fetch(user.id).catch(() => null);
                    if (currentMember && currentMember.roles.cache.has(mutedRole.id)) {
                        await currentMember.roles.remove(mutedRole);
                    }
                } catch (err) {
                    console.error('Failed to auto-unmute:', err);
                }
            }, durationMs);

            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF8C00)
                .setTitle('🔇 Muted')
                .setDescription(`You have been muted in **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Duration', value: durationText },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

        } catch (err) {
            console.error('Failed to mute user:', err);
            interaction.reply({ content: 'Failed to mute user. Check my permissions.', ephemeral: true });
        }
    }
};

function parseDuration(input) {
    const match = input.match(/^(\d+)([smhd])$/i);
    if (!match) return 600000; // Default 10 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    const multipliers = {
        's': 1000,
        'm': 60000,
        'h': 3600000,
        'd': 86400000
    };
    
    return value * multipliers[unit];
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
}
