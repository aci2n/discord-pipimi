const Discord = require('discord.js');
const client = new Discord.Client();
const process = require('process');
const mlEmbed = require('./ml-embed');
const API_KEY = process.env.DISCORD_API_KEY;

if (!API_KEY) {
    console.error("Should have a Discord API key in the $DISCORD_API_KEY environment variable");
    process.exit(1);
}

client.on('message', message => {
    console.log(message);
    if (message.channel.name === 'bot_log' && message.content === 'embedme') {
        message.channel.send(mlEmbed.createEmbed({todo: 'todo'}));
    }
});

client.login(API_KEY);
