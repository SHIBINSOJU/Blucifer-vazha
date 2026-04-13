const { EmbedBuilder } = require('discord.js');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'mute',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need `Moderate Members` permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to mute. Usage: `!mute @user [duration] [reason]`');
        }

        if (user.id === message.author.id) {
            return message.reply('You cannot mute yourself.');
        }

        if (user.id === message.client.user.id) {
            return message.reply('You cannot mute me.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User is not in this server.');
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('You cannot mute a user with equal or higher role.');
        }

        let duration = args[1];
        let reason = args.slice(2).join(' ');

        if (!duration || isNaN(this.parseDuration(duration))) {
            reason = args.slice(1).join(' ');
            duration = '10m';
        }

        const durationMs = this.parseDuration(duration);
        const durationText = this.formatDuration(durationMs);
        reason = reason || 'No reason provided';

        const mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!mutedRole) {
            return message.reply('Muted role not found. Please create a role named "Muted" or use `!setup` to configure.');
        }

        try {
            await member.roles.add(mutedRole);

            await ModLogger.log(message.guild, 'MUTE', {
                userId: user.id,
                moderatorId: message.author.id,
                duration: durationText,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF8C00)
                .setTitle('🔇 User Muted')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Duration', value: durationText, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

            setTimeout(async () => {
                try {
                    const currentMember = await message.guild.members.fetch(user.id).catch(() => null);
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
                .setDescription(`You have been muted in **${message.guild.name}**`)
                .addFields(
                    { name: 'Duration', value: durationText },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(() => {});

        } catch (err) {
            console.error('Failed to mute user:', err);
            message.reply('Failed to mute user. Check my permissions.');
        }
    },

    parseDuration(input) {
        const match = input.match(/^(\d+)([smhd])$/i);
        if (!match) return 0;
        
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        const multipliers = {
            's': 1000,
            'm': 60000,
            'h': 3600000,
            'd': 86400000
        };
        
        return value * multipliers[unit];
    },

    formatDuration(ms) {
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
};
