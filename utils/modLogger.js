const { EmbedBuilder } = require('discord.js');
const { automodSettings } = require('./database');

class ModLogger {
    static async log(guild, type, data) {
        const settings = automodSettings.get(guild.id);
        if (!settings.log_channel_id) return;

        const channel = guild.channels.cache.get(settings.log_channel_id);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setFooter({ text: `ID: ${data.targetId || 'N/A'}` });

        switch (type) {
            case 'WARN':
                embed
                    .setColor(0xFFA500)
                    .setTitle('⚠️ User Warned')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' },
                        { name: 'Total Warnings', value: `${data.totalWarnings}`, inline: true }
                    );
                break;

            case 'UNWARN':
                embed
                    .setColor(0x00FF00)
                    .setTitle('✅ Warning Removed')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Remaining Warnings', value: `${data.remainingWarnings}`, inline: true }
                    );
                break;

            case 'CLEARWARNS':
                embed
                    .setColor(0x00FF00)
                    .setTitle('🗑️ Warnings Cleared')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Cleared Count', value: `${data.clearedCount}`, inline: true }
                    );
                break;

            case 'MUTE':
                embed
                    .setColor(0xFF8C00)
                    .setTitle('🔇 User Muted')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Duration', value: data.duration || 'Indefinite', inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    );
                break;

            case 'UNMUTE':
                embed
                    .setColor(0x00FF00)
                    .setTitle('🔊 User Unmuted')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    );
                break;

            case 'KICK':
                embed
                    .setColor(0xFF4500)
                    .setTitle('👢 User Kicked')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    );
                break;

            case 'BAN':
                embed
                    .setColor(0xFF0000)
                    .setTitle('🔨 User Banned')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    );
                break;

            case 'UNBAN':
                embed
                    .setColor(0x00FF00)
                    .setTitle('🔓 User Unbanned')
                    .addFields(
                        { name: 'User', value: `${data.userId}`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    );
                break;

            case 'PURGE':
                embed
                    .setColor(0x3498DB)
                    .setTitle('🧹 Messages Purged')
                    .addFields(
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Amount', value: `${data.amount}`, inline: true }
                    );
                break;

            case 'AUTOMOD_DELETE':
                embed
                    .setColor(0x9B59B6)
                    .setTitle('🛡️ AutoMod: Message Deleted')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Violation', value: data.violationType, inline: true },
                        { name: 'Action', value: data.action, inline: true }
                    );
                if (data.content) {
                    embed.addFields({ name: 'Content', value: data.content.substring(0, 1024) });
                }
                break;

            case 'AUTOMOD_WARN':
                embed
                    .setColor(0xFFA500)
                    .setTitle('🛡️ AutoMod: User Warned')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Violation', value: data.violationType, inline: true },
                        { name: 'Total Warnings', value: `${data.totalWarnings}`, inline: true }
                    );
                break;

            case 'AUTOMOD_MUTE':
                embed
                    .setColor(0xFF4500)
                    .setTitle('🛡️ AutoMod: User Muted')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Violation', value: data.violationType, inline: true },
                        { name: 'Duration', value: data.duration, inline: true }
                    );
                break;

            case 'AUTOMOD_KICK':
                embed
                    .setColor(0xFF0000)
                    .setTitle('🛡️ AutoMod: User Kicked')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Violation', value: data.violationType, inline: true }
                    );
                break;

            case 'AUTOMOD_BAN':
                embed
                    .setColor(0x8B0000)
                    .setTitle('🛡️ AutoMod: User Banned')
                    .addFields(
                        { name: 'User', value: `<@${data.userId}> (${data.userId})`, inline: true },
                        { name: 'Channel', value: `<#${data.channelId}>`, inline: true },
                        { name: 'Violation', value: data.violationType, inline: true }
                    );
                break;

            case 'SETTINGS_UPDATE':
                embed
                    .setColor(0x3498DB)
                    .setTitle('⚙️ AutoMod Settings Updated')
                    .addFields(
                        { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
                        { name: 'Changes', value: data.changes.join('\n') }
                    );
                break;
        }

        try {
            await channel.send({ embeds: [embed] });
        } catch (err) {
            console.error('Failed to send mod log:', err);
        }
    }
}

module.exports = ModLogger;
