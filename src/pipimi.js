import { Client, Message } from 'discord.js';
import { env, exit } from 'process';
import { getJishoCommands } from './jisho.js';
import { handleMeliCommand } from './ml-fetch.js'
import { getSergeantCommands } from './sergeant.js';
import { getEvalCommands } from './eval.js';
import { PipimiCommand, PipimiContext } from './framework/command.js';

const client = new Client();
const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    exit(1);
}

/** @type {PipimiCommand[]} */
const COMMANDS = [
    ...getJishoCommands(),
    ...getSergeantCommands(),
    ...getEvalCommands()
];

/**
 * @param {Message} message
 */
const messageHandler = async message => {
    if (message.author.bot) {
        return;
    }

    // legacy commands
    try {
        await handleMeliCommand(message);
    } catch (e) {
        console.error("An error occurred", e, message);
        try {
            await message.channel.send("An error occurred: " + JSON.stringify(e));
        } catch (e) {
            console.error("Failed to send error message :(", e);
        }
    }

    // framework commands
    const context = new PipimiContext(message);
    for (const command of COMMANDS) {
        await command.evaluate(context);
    }
};

client.on('message', messageHandler);
client.login(API_KEY);
