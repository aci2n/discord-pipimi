import { Client, Message } from 'discord.js';
import { env, exit } from 'process';
import { getJishoCommands } from './jisho.js';
import { getMeliCommands } from './ml-fetch.js'
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
    ...getMeliCommands(),
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
    const context = new PipimiContext(message);
    for (const command of COMMANDS) {
        await command.evaluate(context);
    }
};

client.on('message', messageHandler);
client.login(API_KEY);
