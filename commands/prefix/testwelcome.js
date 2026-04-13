require('dotenv').config();
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const welcomeCard = require('../utils/welcomeCard');
const fs = require('fs');

module.exports = {
    name: 'testwelcome',
    async execute(message) {

        if (message.author.bot) return;

        try {
            const member = message.member;

            // ===== LOAD WELCOME TEXT =====
            let welcomeText = "Welcome to ZeakMC";
            try {
                const data = JSON.parse(fs.readFileSync('./data/welcome.json'));
                welcomeText = data.text;
            } catch {}

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

            await message.channel.send({
                content: `${welcomeText} ${member}`,
                files: [attachment],
                components: [row]
            });

        } catch (err) {
            console.log(err);
        }
    }
};
