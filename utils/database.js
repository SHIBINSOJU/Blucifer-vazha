const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'bot.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS automod_settings (
        guild_id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        anti_spam INTEGER DEFAULT 1,
        anti_invite INTEGER DEFAULT 1,
        anti_link INTEGER DEFAULT 0,
        bad_words INTEGER DEFAULT 1,
        anti_caps INTEGER DEFAULT 1,
        mention_spam INTEGER DEFAULT 1,
        anti_scam INTEGER DEFAULT 1,
        spam_threshold INTEGER DEFAULT 5,
        spam_interval INTEGER DEFAULT 5000,
        caps_threshold INTEGER DEFAULT 70,
        mention_threshold INTEGER DEFAULT 5,
        warn_threshold INTEGER DEFAULT 3,
        mute_duration INTEGER DEFAULT 600,
        log_channel_id TEXT,
        muted_role_id TEXT,
        ignored_channels TEXT DEFAULT '[]',
        ignored_roles TEXT DEFAULT '[]',
        bad_words_list TEXT DEFAULT '["fuck","shit","bitch","asshole"]',
        allowed_links TEXT DEFAULT '["discord.gg/yourserver"]',
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS automod_violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        violation_type TEXT NOT NULL,
        content TEXT,
        action_taken TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS message_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        content TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
`);

const warnings = {
    add: (guildId, userId, moderatorId, reason) => {
        const stmt = db.prepare(
            'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)'
        );
        return stmt.run(guildId, userId, moderatorId, reason);
    },

    get: (guildId, userId) => {
        const stmt = db.prepare(
            'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'
        );
        return stmt.all(guildId, userId);
    },

    getCount: (guildId, userId) => {
        const stmt = db.prepare(
            'SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?'
        );
        return stmt.get(guildId, userId).count;
    },

    remove: (warningId) => {
        const stmt = db.prepare('DELETE FROM warnings WHERE id = ?');
        return stmt.run(warningId);
    },

    clear: (guildId, userId) => {
        const stmt = db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?');
        return stmt.run(guildId, userId);
    }
};

const automodSettings = {
    get: (guildId) => {
        const stmt = db.prepare('SELECT * FROM automod_settings WHERE guild_id = ?');
        let settings = stmt.get(guildId);
        if (!settings) {
            db.prepare('INSERT INTO automod_settings (guild_id) VALUES (?)').run(guildId);
            settings = stmt.get(guildId);
        }
        return {
            ...settings,
            ignored_channels: JSON.parse(settings.ignored_channels),
            ignored_roles: JSON.parse(settings.ignored_roles),
            bad_words_list: JSON.parse(settings.bad_words_list),
            allowed_links: JSON.parse(settings.allowed_links)
        };
    },

    update: (guildId, updates) => {
        const keys = Object.keys(updates);
        const values = Object.values(updates).map(v => {
            if (Array.isArray(v)) return JSON.stringify(v);
            return v;
        });
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const stmt = db.prepare(
            `UPDATE automod_settings SET ${setClause}, updated_at = strftime('%s', 'now') WHERE guild_id = ?`
        );
        return stmt.run(...values, guildId);
    },

    toggle: (guildId, feature) => {
        const current = automodSettings.get(guildId);
        const newValue = current[feature] ? 0 : 1;
        const stmt = db.prepare(`UPDATE automod_settings SET ${feature} = ? WHERE guild_id = ?`);
        return stmt.run(newValue, guildId);
    }
};

const automodViolations = {
    add: (guildId, userId, type, content, action) => {
        const stmt = db.prepare(
            'INSERT INTO automod_violations (guild_id, user_id, violation_type, content, action_taken) VALUES (?, ?, ?, ?, ?)'
        );
        return stmt.run(guildId, userId, type, content, action);
    },

    getRecent: (guildId, userId, minutes = 10) => {
        const stmt = db.prepare(
            `SELECT * FROM automod_violations 
             WHERE guild_id = ? AND user_id = ? 
             AND created_at > strftime('%s', 'now') - ? * 60
             ORDER BY created_at DESC`
        );
        return stmt.all(guildId, userId, minutes);
    },

    getCount: (guildId, userId, type = null, hours = 24) => {
        let query = `SELECT COUNT(*) as count FROM automod_violations 
                     WHERE guild_id = ? AND user_id = ? 
                     AND created_at > strftime('%s', 'now') - ? * 3600`;
        if (type) query += ` AND violation_type = ?`;
        const stmt = db.prepare(query);
        return type 
            ? stmt.get(guildId, userId, hours, type).count
            : stmt.get(guildId, userId, hours).count;
    }
};

const messageCache = {
    add: (guildId, userId, channelId, messageId, content) => {
        const stmt = db.prepare(
            'INSERT INTO message_cache (guild_id, user_id, channel_id, message_id, content) VALUES (?, ?, ?, ?, ?)'
        );
        return stmt.run(guildId, userId, channelId, messageId, content);
    },

    getRecent: (guildId, userId, seconds = 10) => {
        const stmt = db.prepare(
            `SELECT * FROM message_cache 
             WHERE guild_id = ? AND user_id = ? 
             AND created_at > strftime('%s', 'now') - ?
             ORDER BY created_at DESC`
        );
        return stmt.all(guildId, userId, seconds);
    },

    getDuplicates: (guildId, userId, content, seconds = 60) => {
        const stmt = db.prepare(
            `SELECT * FROM message_cache 
             WHERE guild_id = ? AND user_id = ? AND content = ?
             AND created_at > strftime('%s', 'now') - ?
             ORDER BY created_at DESC`
        );
        return stmt.all(guildId, userId, content, seconds);
    },

    clean: () => {
        const stmt = db.prepare(
            "DELETE FROM message_cache WHERE created_at < strftime('%s', 'now') - 3600"
        );
        return stmt.run();
    }
};

setInterval(() => {
    messageCache.clean();
}, 60000);

module.exports = {
    db,
    warnings,
    automodSettings,
    automodViolations,
    messageCache
};
