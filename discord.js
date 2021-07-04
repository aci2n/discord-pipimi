const Discord = require('discord.js');
const moment = require('moment');
const client = new Discord.Client();
const process = require('process');
const API_KEY = process.env.DISCORD_API_KEY;

if (!API_KEY) {
    console.error("Should have a Discord API key in the $DISCORD_API_KEY environment variable");
    process.exit(1);
}

client.on('message', message => {
    console.log(message);
});

client.login(API_KEY);
