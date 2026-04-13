# Blucifer Discord Bot

A feature-rich Discord bot with AutoMod, moderation tools, welcome cards, and more.

## Features

- **Welcome System** - Beautiful welcome cards with customizable backgrounds
- **AutoMod** - Automated moderation with anti-spam, anti-invite, bad words filter, and more
- **Moderation Commands** - Warn, mute, kick, ban, purge messages
- **Basic Commands** - Help, ping, uptime, info
- **Persistent Storage** - SQLite database for warnings and settings

## Prerequisites

- Node.js 18 or higher
- A Discord bot token

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SHIBINSOJU/Blucifer-vazha.git
cd Blucifer-vazha
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your bot token and configuration:
```env
TOKEN=your_bot_token_here
WELCOME_CHANNEL_ID=your_welcome_channel_id
RULES_CHANNEL_ID=your_rules_channel_id
AUTO_ROLE_ID=your_auto_role_id
SAY_ROLE_ID=your_say_role_id
```

5. Start the bot:
```bash
node index.js
```

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the token and paste it in your `.env` file
5. Enable these **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`, `applications.commands`
8. Select bot permissions:
   - Manage Roles
   - Kick Members
   - Ban Members
   - Manage Messages
   - Read Messages/View Channels
   - Send Messages
   - Manage Threads
   - Attach Files
   - Read Message History
   - Mention Everyone
   - Add Reactions
   - Use External Emojis
9. Copy the generated URL and invite the bot to your server

## Commands

### General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!help` | Show all commands | `!help [command]` |
| `!ping` | Check bot latency | `!ping` |
| `!uptime` | Show bot uptime | `!uptime` |
| `!info` | Bot information | `!info` |

### Welcome Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `!testwelcome` | Test welcome card | `!testwelcome` | Manage Server |

### Moderation Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `!warn` | Warn a user | `!warn @user [reason]` | Moderate Members |
| `!warnings` | View user warnings | `!warnings [@user]` | Moderate Members |
| `!unwarn` | Remove warning(s) | `!unwarn @user [id]` | Moderate Members |
| `!mute` | Mute a user | `!mute @user [duration] [reason]` | Moderate Members |
| `!unmute` | Unmute a user | `!unmute @user [reason]` | Moderate Members |
| `!kick` | Kick a user | `!kick @user [reason]` | Kick Members |
| `!ban` | Ban a user | `!ban @user [reason]` | Ban Members |
| `!unban` | Unban a user | `!unban <user_id> [reason]` | Ban Members |
| `!purge` | Delete messages | `!purge <1-100>` | Manage Messages |

### Utility Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `!say` | Bot says a message | `!say <message>` | Specific Role |

### AutoMod Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `!automod` | View AutoMod status | `!automod` | Administrator |
| `!automod setup` | Setup guide | `!automod setup` | Administrator |
| `!automod toggle` | Toggle features | `!automod toggle <feature>` | Administrator |
| `!automod set` | Configure settings | `!automod set <setting> <value>` | Administrator |
| `!automod words` | Manage bad words | `!automod words <add/remove/list>` | Administrator |
| `!automod ignore` | Ignore channels/roles | `!automod ignore <channel/role> <mention>` | Administrator |

#### AutoMod Features

- **Anti-Spam** - Rate limiting and duplicate detection
- **Anti-Invite** - Blocks Discord invite links
- **Anti-Link** - Blocks unauthorized URLs
- **Bad Words Filter** - Customizable word blacklist
- **Anti-Caps** - Limits excessive capital letters
- **Mention Spam** - Limits mass mentions
- **Anti-Scam** - Detects common scam/phishing patterns

## AutoMod Setup

1. Create a "Muted" role in your server with no permissions
2. Run `!automod setup` to see the guide
3. Configure AutoMod:
```
!automod set log_channel #mod-logs
!automod set muted_role @Muted
!automod toggle anti_spam
!automod toggle anti_invite
!automod words add badword
```

### AutoMod Punishment System

| Violations | Action |
|------------|--------|
| 1st violation | Delete message + warn |
| Warn threshold reached | Auto-mute |
| 2x warn threshold | Auto-kick |
| 3x warn threshold | Auto-ban |
| Scam detected | Immediate ban |

## Customizing Welcome Cards

1. Replace `assets/bg.png` with your own background image
2. Recommended size: 1024x450 pixels
3. The bot will automatically apply the background to welcome cards

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TOKEN` | Discord bot token | Yes |
| `WELCOME_CHANNEL_ID` | Channel for welcome messages | No |
| `RULES_CHANNEL_ID` | Channel for rules button | No |
| `AUTO_ROLE_ID` | Role given to new members | No |
| `SAY_ROLE_ID` | Role allowed to use !say | No |

## Database

The bot uses SQLite for persistent storage:
- **Warnings** - Stored in `data/bot.db`
- **AutoMod Settings** - Per-server configuration
- **Message Cache** - Temporary message storage for spam detection

## Troubleshooting

### Bot not responding?
- Check if the token is correct in `.env`
- Ensure the bot has proper permissions
- Check if intents are enabled in Developer Portal

### AutoMod not working?
- Run `!automod status` to check if it's enabled
- Ensure the bot has "Manage Messages" permission
- Check if the channel/role is in the ignore list

### Welcome cards not sending?
- Verify `WELCOME_CHANNEL_ID` is correct
- Ensure the bot has "Send Messages" and "Attach Files" permissions
- Check if `assets/bg.png` exists

### Database errors?
- Ensure the `data/` directory is writable
- Try deleting `data/bot.db` to reset (will lose warnings data)

## Support

For issues or feature requests, please open an issue on GitHub:
https://github.com/SHIBINSOJU/Blucifer-vazha/issues

## License

ISC

## Credits

- Built with [Discord.js](https://discord.js.org/)
- Canvas rendering with [node-canvas](https://github.com/Automattic/node-canvas)
- Database powered by [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
