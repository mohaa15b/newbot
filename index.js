require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", function () {
    console.log("Client ready!");
});

const gameMem = {};
const gameHistory = {};
const conversations = {};



client.on("interactionCreate" , async function (interaction) {
    if (interaction.commandName === "judge") {
        const situation = interaction.options.getString("situation");
        const userid = interaction.user.id;
      

        try {
            await interaction.deferReply();

            console.log("Sending request to gemini..");

            if (!conversations[userid]) {
            conversations[userid] = [];
             conversations[userid].push({
                role: "user",
                parts: [{text: situation}]
             }
            )}

    
            else {
            conversations[userid].push({
                role: "user",
                parts: [{text: situation}]
              }
            )}

            const rawresponse = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: conversations[userid],
                config: {
                    systemInstruction: "You are a virtual assistant designed to help people in their general life problems. analyze their situation and tell them your opinion. Be mature and not aggressive and explain calmly while being empathetic.Use modern generally understandable english. Do not write a response that is bigger than 500 letters."
                }
            });

            const response = rawresponse.text;

            console.log("Gemini replies.")

            if (response && rawresponse.text) {
                await interaction.editReply(response);
            } else {
                await interaction.editReply("Gemini boş bir yanıt döndürdü, lütfen tekrar deneyin.");
            }

            conversations[userid].push({
                role: "model",
                parts: [{text: response}]
            })
        
        console.log(conversations[userid]);}

        catch (error) {
            console.log("Error: " + error);
            await interaction.editReply("Error...");
        }
    }   

    if (interaction.commandName === "startgame") {
        const level = interaction.options.getString("level")
        

        if (level === "level1") {
            const useridgame = interaction.user.id;
            if (!gameMem[useridgame]) {
                gameMem[useridgame] = {
                    gameOn: true,
                    tries: 12
                };
            }

            else {
                gameMem[useridgame] =
                    {gameOn: true,
                    tries: 12}

            }

            console.log(gameMem);


            interaction.reply("You are a interrogator interrogating a bank robber. You have these against him: camera evidence, fingerprints on the vault, and a papernote of the plan. Your job is to raise his stressbar to 100, that will make him confess. You have 12 tries. Goodluck." )
        }

    }

    if (interaction.commandName === "endgame") {
        const useridgame = interaction.user.id;
        if (!gameMem[useridgame]) {interaction.reply("You dont have an existing game profile!")}

        else if (gameMem[useridgame].gameOn === true) {
            resetStats(useridgame);
            interaction.reply("Game ended.")
        }
    }
});

 function resetStats (idhere) {gameMem[idhere].gameOn = false;
        gameMem[idhere].tries = 12;}

client.on("messageCreate", async function (message) {
    if (gameMem [message.author.id] && gameMem[message.author.id].gameOn === true) {
        const msgLoading = await message.reply("Getting a response...");

            if (gameMem[message.author.id].tries === 0) {
                await message.reply("You have 0 tries left. Your game has ended.")
                resetStats(message.author.id);
            }

            else {
                try {
                     gameMem[message.author.id].tries--;

            if (!gameHistory[message.author.id]) {
                gameHistory[message.author.id] = [];
                gameHistory[message.author.id].push({
                    role: "user",
                    parts: [{text: message.content}]
                })
            }

            else {
                  gameHistory[message.author.id].push({
                    role: "user",
                    parts: [{text: message.content}]
                })
            }

            const gamerawresponse =  await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: gameHistory[message.author.id],
                config: {
                    systemInstruction: "You are a bank robber and the police have arrested you and is interrogating you. Stay realistic. They have a camera footage, fingerprints on vault and a papernote of the plans you made against you. You have a stressbar/stress level of " + gameMem[message.author.id].stress + " out of 100. İn the end of the message depending on what the interrogator says, return a value of the stress added, the maximum is 20. Make your response less than 800 characters. İf the stress bar reaches 100 u create a fake story matching with every prompt and the lore and dump it all in one message. And then at the end of the message you say Game Won. Be careful on the stress added because the interrogator has 12 tries to make you confess, so add stress points accordingly. Write how much stres you added and how much stress is there"
                }
            });
            
            await msgLoading.edit(gamerawresponse.text + " You have " + gameMem[message.author.id].tries + " tries left.");

             gameHistory[message.author.id].push({
                role: "model",
                parts: [{text: gamerawresponse.text}]
             })
            
                }

                catch (error) {console.log("Error: " + error)
            await msgLoading.edit("An error happened...")}
            }

           
        

    }
    }
)


client.login(process.env.TOKEN);