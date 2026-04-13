require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
const commandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(slashCommandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing required properties.`);
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // For global commands (takes up to 1 hour to propagate)
        // const data = await rest.put(
        //     Routes.applicationCommands(process.env.CLIENT_ID),
        //     { body: commands },
        // );

        // For guild-specific commands (instant update, good for testing)
        if (!process.env.GUILD_ID) {
            console.log('[WARNING] GUILD_ID not set in .env. Set it to deploy commands to a specific server for testing.');
            console.log('To get your Guild ID: Enable Developer Mode in Discord → Right-click server → Copy Server ID');
            process.exit(1);
        }

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        console.log('\nDeployed commands:');
        data.forEach(cmd => console.log(`  - /${cmd.name}`));

    } catch (error) {
        console.error(error);
    }
})();
