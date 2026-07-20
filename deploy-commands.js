const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
    new SlashCommandBuilder()
        .setName("judge")
        .setDescription("Tell the AI your situation and let them analyze it.")
        .addStringOption(options =>
            options.setName("situation")
            .setDescription("Write your situation.")
            .setRequired(true),    
        ),
    new SlashCommandBuilder()
        .setName("startgame")
        .setDescription("Start the AI interrogation game.")
        .addStringOption(options => 
            options.setName("level")
                .setDescription("Choose level.")
                .setRequired(true)
                .addChoices(
                    { name: "Level 1", value: "level1"}
                )
        ),
    new SlashCommandBuilder()
        .setName("endgame")
        .setDescription("End the interrogation game.")

].map (command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Slash komutları Discord'a yükleniyor...");

        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commands },
        );

        console.log("Komutlar başarıyla yüklendi! Artık /judge kullanılabilir.");
    } catch (error) {
        console.error("Yükleme Hatası:", error);
    }
})();