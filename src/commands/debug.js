import { PipimiCommand, PipimiContext } from "../framework/command.js";
import { ChannelLogger, CompositeLogger, ConsoleLogger, LogLevel, PriorityLogger } from "../framework/logger.js";

/**
 * @returns {PipimiCommand[]}
 */
const getDebugCommands = () => {
    return Object.values(LogLevel.LEVELS).map(level => PipimiCommand.prefixed(
        [level.name],
        ["sudoers"],
        async (context, args) => await createDebugContext(context, args, level)));
};

/**
 * @param {PipimiContext} context 
 * @param {string} content 
 * @param {LogLevel} level 
 * @returns {Promise<PipimiContext>}
 */
const createDebugContext = async (context, content, level) => {
    const { message } = context;
    const { channel } = message;
    const logger = new PriorityLogger(level, new CompositeLogger(new ConsoleLogger(), new ChannelLogger(channel)));

    // did not find a decent way to avoid modifying the original message
    message.content = content;

    return new PipimiContext(message, context.prefix, logger);
};

export { getDebugCommands };
