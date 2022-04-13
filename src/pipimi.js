import { Client } from 'discord.js';
import process from 'process';
import { getJishoCommands } from './commands/jisho.js';
import { getMeliCommands } from './commands/meli.js'
import { getSergeantCommands } from './commands/sergeant.js';
import { getEvalCommands } from './commands/eval.js';
import { PipimiCommand, PipimiContext } from './framework/command.js';
import { getDebugCommands } from './commands/debug.js';
import { ConsoleLogger, LogLevel, PriorityLogger } from './framework/logger.js';
import { getKashiCommands } from './commands/kashi.js';

const init = () => {
    const apiKey = process.env['PIPIMI_API_KEY'];

    if (!apiKey) {
        console.error(`should have a Discord API key in the PIPIMI_API_KEY environment variable`);
        process.exit(1);
    }

    process.on("unhandledRejection", (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    /** @type {PipimiCommand[]} */
    const commands = [
        ...getDebugCommands(),
        ...getMeliCommands(),
        ...getJishoCommands(),
        ...getSergeantCommands(),
        ...getEvalCommands(),
        ...getKashiCommands()
    ];
    const prefix = process.env['PIPIMI_PREFIX'] || "!";
    const client = new Client();
    const logger = new PriorityLogger(LogLevel.LEVELS.DEBUG, new ConsoleLogger());

    client.on('message', async message => {
        if (message.author.bot) {
            return;
        }
        await PipimiCommand.execute(commands, new PipimiContext(message, prefix, logger));
    });
    client.login(apiKey);
};

init();