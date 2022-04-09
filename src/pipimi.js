import { Client } from 'discord.js';
import { env, exit } from 'process';
import { handleJishoCommand } from './jisho.js';
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

    try {
        handleMeliCommand(message);
        handleSergeantCommand(message);
        handleJishoCommand(message);
    } catch(e) {
        console.error("An error occurred handling: ", message);
        await message.vchannel.send("An error occurred.");
    }
});

client.login(API_KEY);
