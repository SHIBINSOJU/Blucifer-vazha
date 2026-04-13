const { messageCache, automodSettings } = require('./database');

const patterns = {
    discordInvite: /(discord\.gg\/|discordapp\.com\/invite\/|discord\.com\/invite\/)[a-zA-Z0-9-]+/gi,
    url: /(https?:\/\/|www\.)[^\s]+/gi,
    mention: /<@!?(\d+)>/g,
    everyoneHere: /@(everyone|here)/g,
    scamPatterns: [
        /free\s*nitro/gi,
        /nitro\s*free/gi,
        /steam\s*gift/gi,
        /gift\s*discord/gi,
        /discord\s*gift/gi,
        /\$\{.*\}/g,
        /@everyone.*free.*nitro/gi,
        /nitro.*@everyone/gi,
        /click.*get.*nitro/gi,
        /claim.*nitro/gi,
        /discord\.gift\/[a-z0-9]+/gi,
        /bit\.ly.*nitro/gi,
        /tinyurl.*nitro/gi,
        /discord-nitro/gi,
        /dicsord/gi,
        /dlscord/gi,
        /discorcl/gi
    ]
};

class AutoModDetectors {
    static checkSpam(message, settings) {
        if (!settings.anti_spam) return { triggered: false };

        const recentMessages = messageCache.getRecent(
            message.guild.id, 
            message.author.id, 
            Math.floor(settings.spam_interval / 1000)
        );

        if (recentMessages.length >= settings.spam_threshold) {
            return {
                triggered: true,
                type: 'Spam',
                reason: `${recentMessages.length} messages in ${settings.spam_interval}ms`
            };
        }

        const duplicates = messageCache.getDuplicates(
            message.guild.id,
            message.author.id,
            message.content,
            60
        );

        if (duplicates.length >= 3) {
            return {
                triggered: true,
                type: 'Duplicate Messages',
                reason: `${duplicates.length} duplicate messages`
            };
        }

        return { triggered: false };
    }

    static checkInvites(message, settings) {
        if (!settings.anti_invite) return { triggered: false };

        const matches = message.content.match(patterns.discordInvite);
        if (matches) {
            const allowed = settings.allowed_links || [];
            const hasAllowed = allowed.some(link => 
                message.content.toLowerCase().includes(link.toLowerCase())
            );
            
            if (!hasAllowed) {
                return {
                    triggered: true,
                    type: 'Discord Invite',
                    reason: `Found: ${matches.join(', ')}`
                };
            }
        }

        return { triggered: false };
    }

    static checkLinks(message, settings) {
        if (!settings.anti_link) return { triggered: false };

        const matches = message.content.match(patterns.url);
        if (matches) {
            const allowed = settings.allowed_links || [];
            const hasAllowed = allowed.some(link => 
                message.content.toLowerCase().includes(link.toLowerCase())
            );
            
            if (!hasAllowed) {
                return {
                    triggered: true,
                    type: 'Unauthorized Link',
                    reason: `Found: ${matches.join(', ')}`
                };
            }
        }

        return { triggered: false };
    }

    static checkBadWords(message, settings) {
        if (!settings.bad_words) return { triggered: false };

        const badWords = settings.bad_words_list || [];
        const content = message.content.toLowerCase();
        const found = [];

        for (const word of badWords) {
            const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'gi');
            if (regex.test(content)) {
                found.push(word);
            }
        }

        if (found.length > 0) {
            return {
                triggered: true,
                type: 'Bad Words',
                reason: `Found: ${found.join(', ')}`
            };
        }

        return { triggered: false };
    }

    static checkCaps(message, settings) {
        if (!settings.anti_caps) return { triggered: false };

        const content = message.content.replace(/\s/g, '').replace(/[^a-zA-Z]/g, '');
        if (content.length < 10) return { triggered: false };

        const capsCount = content.replace(/[^A-Z]/g, '').length;
        const capsPercentage = (capsCount / content.length) * 100;

        if (capsPercentage >= settings.caps_threshold) {
            return {
                triggered: true,
                type: 'Excessive Caps',
                reason: `${capsPercentage.toFixed(0)}% caps (threshold: ${settings.caps_threshold}%)`
            };
        }

        return { triggered: false };
    }

    static checkMentions(message, settings) {
        if (!settings.mention_spam) return { triggered: false };

        const userMentions = message.content.match(patterns.mention) || [];
        const everyoneMentions = message.content.match(patterns.everyoneHere) || [];
        const totalMentions = userMentions.length + (everyoneMentions.length * 5);

        if (totalMentions >= settings.mention_threshold) {
            return {
                triggered: true,
                type: 'Mention Spam',
                reason: `${userMentions.length} users + ${everyoneMentions.length} @everyone/@here`
            };
        }

        return { triggered: false };
    }

    static checkScam(message, settings) {
        if (!settings.anti_scam) return { triggered: false };

        const content = message.content.toLowerCase();
        const foundPatterns = [];

        for (const pattern of patterns.scamPatterns) {
            if (pattern.test(content)) {
                foundPatterns.push(pattern.toString());
            }
        }

        if (foundPatterns.length > 0) {
            return {
                triggered: true,
                type: 'Scam/Phishing',
                reason: 'Detected potential scam content'
            };
        }

        return { triggered: false };
    }

    static checkAll(message) {
        const settings = automodSettings.get(message.guild.id);
        
        if (!settings.enabled) return [];

        const ignoredChannels = settings.ignored_channels || [];
        if (ignoredChannels.includes(message.channel.id)) return [];

        const memberRoles = message.member?.roles?.cache?.map(r => r.id) || [];
        const ignoredRoles = settings.ignored_roles || [];
        if (memberRoles.some(role => ignoredRoles.includes(role))) return [];

        const violations = [];

        const checks = [
            this.checkSpam(message, settings),
            this.checkInvites(message, settings),
            this.checkLinks(message, settings),
            this.checkBadWords(message, settings),
            this.checkCaps(message, settings),
            this.checkMentions(message, settings),
            this.checkScam(message, settings)
        ];

        for (const check of checks) {
            if (check.triggered) {
                violations.push(check);
            }
        }

        return violations;
    }
}

module.exports = AutoModDetectors;
