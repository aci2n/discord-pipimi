import { Client, Message } from 'discord.js';
import { env, exit } from 'process';
import { getJishoCommands } from './commands/jisho.js';
import { getMeliCommands } from './commands/meli.js'
import { getSergeantCommands } from './commands/sergeant.js';
import { getEvalCommands } from './commands/eval.js';
import { PipimiCommand, PipimiContext } from './framework/command.js';

const init = () => {
    const apiKey = env['PIPIMI_API_KEY'];

    if (!apiKey) {
        console.error(`should have a Discord API key in the PIPIMI_API_KEY environment variable`);
        exit(1);
    }

    /** @type {PipimiCommand[]} */
    const commands = [
        ...getMeliCommands(),
        ...getJishoCommands(),
        ...getSergeantCommands(),
        ...getEvalCommands()
    ];
    const prefix = env['PIPIMI_PREFIX'] || "!";
    const client = new Client();

    client.on('message', async message => {
        if (message.author.bot) {
            return;
        }
        const context = new PipimiContext(message, prefix);
        for (const command of commands) {
            await command.evaluate(context);
        }
    });
    client.login(apiKey);
};

init();