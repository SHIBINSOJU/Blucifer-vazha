require('dotenv').config();
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

            // ===== BUTTON =====
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Rules')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('rules_btn')
            );

            const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
            if (!channel) return;

            await channel.send({
                content: `Welcome to ZeakMC ${member}`,
                files: [attachment],
                components: [row]
            });

        } catch (err) {
            console.log(err);
        }
    });

    // ===== BUTTON INTERACTION =====
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'rules_btn') {
            const channelId = process.env.RULES_CHANNEL_ID;

            await interaction.reply({
                content: `Check rules here: <#${channelId}>`,
                ephemeral: true
            });
        }
    });
};
