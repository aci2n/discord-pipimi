import { PipimiCommand } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getEvalCommands = () => {
    return [PipimiCommand.prefixed(["eval"], ["sudoers", "hackerman"], async (context, args) => {
        const { logger, message } = context;
        const { channel } = message;
        const expression = extractCodeBlock(args);

        if (!expression) {
            await channel.send("Empty expression.");
            return context;
        }

        let result;
        try {
            logger.debug(() => `Evaluating javascript \`\`\`js\n${expression}\n\`\`\``);
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


const extractCodeBlock = (() => {
    const delimiters = [
        { start: /^```\w+\n/, end: /```$/ },
        { start: /^```/, end: /```$/ }
    ];

    /**
     * @param {string} raw 
     * @returns {string}
     */
    return raw => {
        const str = raw.trim();
        for (const { start, end } of delimiters) {
            const head = str.match(start);
            if (!head) continue;
            const tail = str.match(end);
            if (!tail) continue;
            return str.substring(head[0].length, str.length - tail[0].length).trim();
        }
        return str;
    };
})();

export { getEvalCommands };
