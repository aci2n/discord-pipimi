import { Client } from 'discord.js';
import { env, exit } from 'process';
import { handleMeliCommand } from './ml-fetch.js'
import { handleSergeantCommand } from './sergeant.js';

const client = new Client();
const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    exit(1);
}

client.on('message', message => {
    if (message.author.bot) return;
    handleMeliCommand(message);
    handleSergeantCommand(message);
});


client.login(API_KEY);
