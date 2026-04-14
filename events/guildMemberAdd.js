require('dotenv').config();
const { AttachmentBuilder } = require('discord.js');
const welcomeCard = require('../utils/welcomeCard');

module.exports = async (client) => {
    client.on('guildMemberAdd', async (member) => {
        try {
            // ===== AUTO ROLE =====
            if (process.env.AUTO_ROLE_ID) {
                const role = member.guild.roles.cache.get(process.env.AUTO_ROLE_ID);
                if (role) await member.roles.add(role).catch(() => {});
            }

            // ===== CREATE IMAGE =====
            const buffer = await welcomeCard(member);
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

            const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
            if (!channel) return;

            await channel.send({
                content: `Welcome to ZeakMC ${member}`,
                files: [attachment]
            });

        } catch (err) {
            console.log(err);
        }
    });
};
