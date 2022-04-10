import { PipimiCommand, PipimiContext } from "../framework/command.js";
import { ChannelLogger, CompositeLogger, GranularityLogger } from "../framework/logger.js";

/**
 * @returns {PipimiCommand[]}
 */
const getDebugCommands = () => {
    const command = (name, granularity) => PipimiCommand.standard(
        name,
        ["sudoers"],
        async (context, args) => await createDebugContext(context, args, granularity));

    return [
        command("error", GranularityLogger.ERROR),
        command("warn", GranularityLogger.WARN),
        command("info", GranularityLogger.INFO),
        command("debug", GranularityLogger.DEBUG),
        command("trace", GranularityLogger.TRACE)
    ]
};

/**
 * @param {PipimiContext} context 
 * @param {string} content 
 * @param {number} granularity 
 * @returns {Promise<PipimiContext>}
 */
const createDebugContext = async (context, content, granularity) => {
    const { message } = context;
    const { channel } = message;
    const logger = new CompositeLogger(context.logger, new GranularityLogger(granularity, new ChannelLogger(channel)));

    // did not find a decent way to avoid modifying the original message
    message.content = content;

    return new PipimiContext(message, context.prefix, logger);
};

export { getDebugCommands };
