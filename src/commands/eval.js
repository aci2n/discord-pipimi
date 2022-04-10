import { PipimiCommand } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getEvalCommands = () => {
    const delimiter = "```";

    return [PipimiCommand.standard("eval", ["sudoers"], async (context, args) => {
        const { logger, message } = context;
        const { channel } = message;
        let expression = args.trim();

        if (expression.startsWith(delimiter) && expression.endsWith(delimiter)) {
            expression = expression.substring(delimiter.length, expression.length - delimiter.length);
        }

        if (!expression) {
            await channel.send("Empty expression.");
            return context;
        }

        let result;
        try {
            logger.debug(() => "Evaluating javascript: " + expression);
            const start = Date.now();
            result = eval(expression);
            const elapsed = Date.now() - start;
            logger.debug(() => `Expression evaluated in ${elapsed}ms`);
        } catch (e) {
            logger.error(() => "Could not evaluate expression: " + e);
            await channel.send("Could not evaluate expression.");
            return context;
        }

        await channel.send(String(result));
        return context;
    })];
};

export { getEvalCommands };
