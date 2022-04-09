import { Client, Message } from 'discord.js';
import { env, exit } from 'process';
import { handleJishoCommand } from './jisho.js';
import { handleMeliCommand } from './ml-fetch.js'
import { handleSergeantCommand } from './sergeant.js';
import { handleEval } from './eval.js';

const client = new Client();
const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    exit(1);
}

/**
 * @param {Message} message
 */
const messageHandler = async message => {
    if (message.author.bot) {
        return;
    }

    try {
        await handleMeliCommand(message);
        await handleSergeantCommand(message);
        await handleJishoCommand(message);
        await handleEval(message);
    } catch (e) {
        console.error("An error occurred handling", message);
        try {
            await message.channel.send("An error occurred: " + JSON.stringify(e));
        } catch (e) {
            console.error("Failed to send error message :(");
        }
    }
};

client.on('message', messageHandler);
client.login(API_KEY);
