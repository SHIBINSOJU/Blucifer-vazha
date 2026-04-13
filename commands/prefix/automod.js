const { EmbedBuilder } = require('discord.js');
const { automodSettings } = require('../utils/database');
const ModLogger = require('../utils/modLogger');

module.exports = {
    name: 'automod',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('You need `Administrator` permission to use this command.');
        }

        const subcommand = args[0]?.toLowerCase();
        const settings = automodSettings.get(message.guild.id);

        if (!subcommand || subcommand === 'status') {
            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle('🛡️ AutoMod Settings')
                .addFields(
                    { name: 'Status', value: settings.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-Spam', value: settings.anti_spam ? '✅' : '❌', inline: true },
                    { name: 'Anti-Invite', value: settings.anti_invite ? '✅' : '❌', inline: true },
                    { name: 'Anti-Link', value: settings.anti_link ? '✅' : '❌', inline: true },
                    { name: 'Bad Words', value: settings.bad_words ? '✅' : '❌', inline: true },
                    { name: 'Anti-Caps', value: settings.anti_caps ? '✅' : '❌', inline: true },
                    { name: 'Mention Spam', value: settings.mention_spam ? '✅' : '❌', inline: true },
                    { name: 'Anti-Scam', value: settings.anti_scam ? '✅' : '❌', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Spam Threshold', value: `${settings.spam_threshold} msgs`, inline: true },
                    { name: 'Spam Interval', value: `${settings.spam_interval}ms`, inline: true },
                    { name: 'Caps Threshold', value: `${settings.caps_threshold}%`, inline: true },
                    { name: 'Mention Threshold', value: `${settings.mention_threshold} mentions`, inline: true },
                    { name: 'Warn Threshold', value: `${settings.warn_threshold} violations`, inline: true },
                    { name: 'Mute Duration', value: `${settings.mute_duration}s`, inline: true }
                )
                .setFooter({ text: 'Use !automod toggle <feature> to enable/disable features' })
                .setTimestamp();

            if (settings.log_channel_id) {
                embed.addFields({ name: 'Log Channel', value: `<#${settings.log_channel_id}>`, inline: true });
            }
            if (settings.muted_role_id) {
                const role = message.guild.roles.cache.get(settings.muted_role_id);
                embed.addFields({ name: 'Muted Role', value: role ? role.name : 'Not found', inline: true });
            }

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'toggle') {
            const feature = args[1]?.toLowerCase();
            const validFeatures = [
                'enabled', 'anti_spam', 'anti_invite', 'anti_link', 
                'bad_words', 'anti_caps', 'mention_spam', 'anti_scam'
            ];

            if (!feature || !validFeatures.includes(feature)) {
                return message.reply(`Invalid feature. Valid: ${validFeatures.join(', ')}`);
            }

            automodSettings.toggle(message.guild.id, feature);
            const newState = automodSettings.get(message.guild.id)[feature];

            await ModLogger.log(message.guild, 'SETTINGS_UPDATE', {
                moderatorId: message.author.id,
                changes: [`${feature} set to ${newState ? 'enabled' : 'disabled'}`]
            });

            return message.reply(`${feature} is now ${newState ? 'enabled' : 'disabled'}`);
        }

        if (subcommand === 'set') {
            const setting = args[1]?.toLowerCase();
            const value = args[2];

            if (!setting || !value) {
                return message.reply('Usage: `!automod set <setting> <value>`');
            }

            const validSettings = {
                'spam_threshold': 'spam_threshold',
                'spam_interval': 'spam_interval',
                'caps_threshold': 'caps_threshold',
                'mention_threshold': 'mention_threshold',
                'warn_threshold': 'warn_threshold',
                'mute_duration': 'mute_duration',
                'log_channel': 'log_channel_id',
                'muted_role': 'muted_role_id'
            };

            if (!validSettings[setting]) {
                return message.reply(`Invalid setting. Valid: ${Object.keys(validSettings).join(', ')}`);
            }

            let parsedValue = value;
            if (['spam_threshold', 'spam_interval', 'caps_threshold', 'mention_threshold', 'warn_threshold', 'mute_duration'].includes(setting)) {
                parsedValue = parseInt(value);
                if (isNaN(parsedValue)) {
                    return message.reply('Value must be a number.');
                }
            }

            if (setting === 'log_channel') {
                const channel = message.mentions.channels.first();
                if (!channel) {
                    return message.reply('Please mention a channel.');
                }
                parsedValue = channel.id;
            }

            if (setting === 'muted_role') {
                const role = message.mentions.roles.first();
                if (!role) {
                    return message.reply('Please mention a role.');
                }
                parsedValue = role.id;
            }

            automodSettings.update(message.guild.id, { [validSettings[setting]]: parsedValue });

            await ModLogger.log(message.guild, 'SETTINGS_UPDATE', {
                moderatorId: message.author.id,
                changes: [`${setting} set to ${value}`]
            });

            return message.reply(`${setting} has been set to ${value}`);
        }

        if (subcommand === 'words') {
            const action = args[1]?.toLowerCase();
            const word = args[2]?.toLowerCase();

            if (!action || !['add', 'remove', 'list'].includes(action)) {
                return message.reply('Usage: `!automod words <add/remove/list> [word]`');
            }

            const currentWords = settings.bad_words_list || [];

            if (action === 'list') {
                const embed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle('📝 Bad Words List')
                    .setDescription(currentWords.join(', ') || 'No words set')
                    .setTimestamp();
                return message.channel.send({ embeds: [embed] });
            }

            if (!word) {
                return message.reply('Please provide a word.');
            }

            if (action === 'add') {
                if (currentWords.includes(word)) {
                    return message.reply('Word already in list.');
                }
                currentWords.push(word);
                automodSettings.update(message.guild.id, { bad_words_list: currentWords });
                return message.reply(`Added "${word}" to bad words list.`);
            }

            if (action === 'remove') {
                const index = currentWords.indexOf(word);
                if (index === -1) {
                    return message.reply('Word not found in list.');
                }
                currentWords.splice(index, 1);
                automodSettings.update(message.guild.id, { bad_words_list: currentWords });
                return message.reply(`Removed "${word}" from bad words list.`);
            }
        }

        if (subcommand === 'ignore') {
            const type = args[1]?.toLowerCase();
            const target = args[2];

            if (!type || !['channel', 'role'].includes(type)) {
                return message.reply('Usage: `!automod ignore <channel/role> <id/mention>`');
            }

            const key = type === 'channel' ? 'ignored_channels' : 'ignored_roles';
            const currentList = settings[key] || [];

            let targetId;
            if (type === 'channel') {
                const channel = message.mentions.channels.first();
                targetId = channel?.id;
            } else {
                const role = message.mentions.roles.first();
                targetId = role?.id;
            }

            if (!targetId) {
                return message.reply(`Please mention a ${type}.`);
            }

            const index = currentList.indexOf(targetId);
            if (index > -1) {
                currentList.splice(index, 1);
                automodSettings.update(message.guild.id, { [key]: currentList });
                return message.reply(`Removed ${type} from ignore list.`);
            } else {
                currentList.push(targetId);
                automodSettings.update(message.guild.id, { [key]: currentList });
                return message.reply(`Added ${type} to ignore list.`);
            }
        }

        if (subcommand === 'setup') {
            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle('🛠️ AutoMod Setup Guide')
                .setDescription('Follow these steps to configure AutoMod:')
                .addFields(
                    { name: '1. Create Muted Role', value: 'Create a role named "Muted" with no permissions' },
                    { name: '2. Set Log Channel', value: '`!automod set log_channel #channel`' },
                    { name: '3. Set Muted Role', value: '`!automod set muted_role @Muted`' },
                    { name: '4. Enable Features', value: '`!automod toggle anti_spam`' },
                    { name: '5. Configure Thresholds', value: '`!automod set spam_threshold 5`' },
                    { name: '6. Add Bad Words', value: '`!automod words add badword`' },
                    { name: '7. Ignore Channels/Roles', value: '`!automod ignore channel #general`' }
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        return message.reply('Unknown subcommand. Use `!automod` for status, `!automod setup` for guide.');
    }
};
