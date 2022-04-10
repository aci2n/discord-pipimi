import { Client } from 'discord.js';
import { env, exit } from 'process';
import { getJishoCommands } from './commands/jisho.js';
import { getMeliCommands } from './commands/meli.js'
import { getSergeantCommands } from './commands/sergeant.js';
import { getEvalCommands } from './commands/eval.js';
import { PipimiCommand, PipimiContext } from './framework/command.js';
import { getDebugCommands } from './commands/debug.js';

const init = () => {
    const apiKey = env['PIPIMI_API_KEY'];

    if (!apiKey) {
        console.error(`should have a Discord API key in the PIPIMI_API_KEY environment variable`);
        exit(1);
    }

    /** @type {PipimiCommand[]} */
    const commands = [
        ...getDebugCommands(),
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
        await PipimiCommand.pipeline(commands, new PipimiContext(message, prefix));
    });
    client.login(apiKey);
};

init();