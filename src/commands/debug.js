import { PipimiCommand, PipimiContext, PipimiResponse } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getDebugCommands = () => {
    return [PipimiCommand.standard("debug", ["sudoers"], async (context, args) => {
        const { message } = context;
        const { channel } = message;
        const debugFunction = async msg => {
            try {
                const formatted = `[DEBUG] ${msg}`;
                console.log(formatted);
                await channel.send(formatted);
            } catch (e) {
                console.error("Could not send debug message", e);
            }
        };

        // did not find a decent way to avoid modifying the original message
        message.content = args;

        return new PipimiResponse(async () => new PipimiContext(message, context.prefix, debugFunction));
    })];
};

export { getDebugCommands };
