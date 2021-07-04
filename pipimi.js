const Discord = require('discord.js');
const client = new Discord.Client();
const process = require('process');
const mlEmbed = require('./ml-embed');

const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = process.env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    process.exit(1);
}

client.on('message', message => {
    // test ML embed item
    if (message.channel.name === 'bot_log' && message.content === 'embedme') {
        message.channel.send(mlEmbed.itemEmbed(require('./test-item.json')));
    }
});

client.login(API_KEY);
