const { EmbedBuilder } = require('discord.js');
const { 
    messageCache, 
    warnings, 
    automodSettings, 
    automodViolations 
} = require('./database');
const AutoModDetectors = require('./automodDetectors');
const ModLogger = require('./modLogger');

class AutoModHandler {
    static async handleMessage(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        messageCache.add(
            message.guild.id,
            message.author.id,
            message.channel.id,
            message.id,
            message.content
        );

        const violations = AutoModDetectors.checkAll(message);
        if (violations.length === 0) return;

        const settings = automodSettings.get(message.guild.id);
        const primaryViolation = violations[0];

        try {
            await message.delete();
        } catch (err) {
            console.error('Failed to delete message:', err);
        }

        await ModLogger.log(message.guild, 'AUTOMOD_DELETE', {
            userId: message.author.id,
            channelId: message.channel.id,
            violationType: primaryViolation.type,
            action: 'Message Deleted',
            content: message.content
        });

        const violationCount = automodViolations.getCount(
            message.guild.id, 
            message.author.id, 
            null, 
            1
        );

        await this.takeAction(message, primaryViolation, violationCount, settings);
    }

    static async takeAction(message, violation, violationCount, settings) {
        const member = message.member;
        if (!member) return;

        const warnThreshold = settings.warn_threshold || 3;
        const muteDuration = settings.mute_duration || 600;

        if (violation.type === 'Scam/Phishing') {
            await this.banUser(message, violation, 'AutoMod: Scam/Phishing detection');
            return;
        }

        if (violationCount >= warnThreshold * 3) {
            await this.banUser(message, violation, `AutoMod: Reached ${warnThreshold * 3} violations`);
        } else if (violationCount >= warnThreshold * 2) {
            await this.kickUser(message, violation, `AutoMod: Reached ${warnThreshold * 2} violations`);
        } else if (violationCount >= warnThreshold) {
            await this.muteUser(message, violation, muteDuration * 2);
        } else {
            await this.warnUser(message, violation);
        }
    }

    static async warnUser(message, violation) {
        const settings = automodSettings.get(message.guild.id);
        
        warnings.add(
            message.guild.id,
            message.author.id,
            message.client.user.id,
            `AutoMod: ${violation.type} - ${violation.reason}`
        );

        const totalWarnings = warnings.getCount(message.guild.id, message.author.id);

        automodViolations.add(
            message.guild.id,
            message.author.id,
            violation.type,
            message.content,
            'Warn'
        );

        await ModLogger.log(message.guild, 'AUTOMOD_WARN', {
            userId: message.author.id,
            channelId: message.channel.id,
            violationType: violation.type,
            totalWarnings
        });

        try {
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ Warning')
                .setDescription(`You have been warned in **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: `AutoMod: ${violation.type}` },
                    { name: 'Details', value: violation.reason },
                    { name: 'Total Warnings', value: `${totalWarnings}` }
                )
                .setTimestamp();

            await message.author.send({ embeds: [embed] });
        } catch (err) {
            console.log('Could not DM user');
        }
    }

    static async muteUser(message, violation, durationSeconds) {
        const settings = automodSettings.get(message.guild.id);
        const mutedRoleId = settings.muted_role_id;

        if (!mutedRoleId) {
            await this.warnUser(message, violation);
            return;
        }

        const mutedRole = message.guild.roles.cache.get(mutedRoleId);
        if (!mutedRole) {
            await this.warnUser(message, violation);
            return;
        }

        try {
            await message.member.roles.add(mutedRole);

            automodViolations.add(
                message.guild.id,
                message.author.id,
                violation.type,
                message.content,
                `Mute (${durationSeconds}s)`
            );

            const durationText = this.formatDuration(durationSeconds);

            await ModLogger.log(message.guild, 'AUTOMOD_MUTE', {
                userId: message.author.id,
                channelId: message.channel.id,
                violationType: violation.type,
                duration: durationText
            });

            setTimeout(async () => {
                try {
                    await message.member.roles.remove(mutedRole);
                } catch (err) {
                    console.error('Failed to unmute user:', err);
                }
            }, durationSeconds * 1000);

            const embed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('🔇 Muted')
                .setDescription(`You have been muted in **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: `AutoMod: ${violation.type}` },
                    { name: 'Duration', value: durationText }
                )
                .setTimestamp();

            await message.author.send({ embeds: [embed] }).catch(() => {});

        } catch (err) {
            console.error('Failed to mute user:', err);
            await this.warnUser(message, violation);
        }
    }

    static async kickUser(message, violation, reason) {
        try {
            automodViolations.add(
                message.guild.id,
                message.author.id,
                violation.type,
                message.content,
                'Kick'
            );

            await ModLogger.log(message.guild, 'AUTOMOD_KICK', {
                userId: message.author.id,
                channelId: message.channel.id,
                violationType: violation.type
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle('👢 Kicked')
                .setDescription(`You have been kicked from **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.author.send({ embeds: [embed] }).catch(() => {});

            await message.member.kick(reason);

        } catch (err) {
            console.error('Failed to kick user:', err);
        }
    }

    static async banUser(message, violation, reason) {
        try {
            automodViolations.add(
                message.guild.id,
                message.author.id,
                violation.type,
                message.content,
                'Ban'
            );

            await ModLogger.log(message.guild, 'AUTOMOD_BAN', {
                userId: message.author.id,
                channelId: message.channel.id,
                violationType: violation.type
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 Banned')
                .setDescription(`You have been banned from **${message.guild.name}**`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await message.author.send({ embeds: [embed] }).catch(() => {});

            await message.member.ban({ reason, deleteMessageDays: 1 });

        } catch (err) {
            console.error('Failed to ban user:', err);
        }
    }

    static formatDuration(seconds) {
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
}

module.exports = AutoModHandler;
