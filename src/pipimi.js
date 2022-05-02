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
import { getFulboCommands } from './commands/fulbo.js';
import { getOcrCommands } from './commands/ocr/ocr.js';

const init = () => {
    process.on('SIGINT', () => process.exit());
    process.on('SIGTERM', () => process.exit());
    process.on("unhandledRejection", (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));

    const apiKey = process.env['PIPIMI_API_KEY'];

    if (!apiKey) {
        console.error(`should have a Discord API key in the PIPIMI_API_KEY environment variable`);
        process.exit(1);
    }

    /** @type {PipimiCommand[]} */
    const commands = [
        ...getDebugCommands(),
        ...getMeliCommands(),
        ...getJishoCommands(),
        ...getSergeantCommands(),
        ...getEvalCommands(),
        ...getKashiCommands(),
        ...getFulboCommands(),
        ...getOcrCommands()
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
    client.on('ready', () => logger.debug(() => "Discord client is ready."));
    client.login(apiKey);
};

init();