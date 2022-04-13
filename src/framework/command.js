import { Message } from "discord.js";
import { PipimiLogger } from "./logger.js";
import { Utils } from "./utils.js";

class PipimiCommand {
    /**
     * @callback CommandHandler
     * @param {PipimiContext} context
     * @return {Promise<PipimiContext>}
     */

    /**
     * @constructor
     * @param {string} name
     * @param {CommandHandler} handler 
     */
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
    }

    /**
     * @callback PrefixCommandHandler
     * @param {PipimiContext} context
     * @param {string} args 
     * @return {Promise<PipimiContext>}
     */

    /**
     * @param {string[]} prefixes 
     * @param {string[]} allowedRoles 
     * @param {PrefixCommandHandler} handler 
     * @returns {PipimiCommand}
     */
    static prefixed(prefixes, allowedRoles, handler) {
        const allowedRolesSet = new Set(allowedRoles);
        const escaped = prefixes.map(prefix => Utils.escapeRegExp(prefix)).join("|");
        const pattern = new RegExp(`^((?:${escaped})\\s?)`);

        return new PipimiCommand(prefixes.join(","), async context => {
            const { message, prefix, logger } = context;
            const { content, member } = message;
            const roles = member.roles.cache.array();

            if (content.substring(0, prefix.length) != prefix) {
                return context;
            }

            const unprefixed = content.substring(prefix.length);
            const match = unprefixed.match(pattern);

            if (!match) {
                logger.trace(() => `Did not match command '${prefixes}'`);
                return context;
            }

            logger.trace(() => `Matched command '${prefixes}'`, match);

            if (allowedRolesSet.size > 0 && !roles.some(role => allowedRolesSet.has(role.name))) {
                return context;
            }

            return await handler(context, unprefixed.substring(match[1].length));
        });
    }

    /**
     * @param {PipimiCommand[]} commands 
     * @param {PipimiContext} initialContext
     * @returns {Promise<PipimiContext>}
     */
    static async execute(commands, initialContext) {
        let context = initialContext;
        for (const command of commands) {
            try {
                const nextContext = await command.handler(context);
                if (nextContext) {
                    context = nextContext;
                } else {
                    context.logger.error(() => `Command '${command.name}' did not return a context`, command);
                }
            } catch (e) {
                context.logger.error(() => `Error handling command '${command.name}'`, e);
            }
        }
        return context;
    }
}

class PipimiContext {
    /**
     * @constructor
     * @param {Message} message 
     * @param {string} prefix
     * @param {PipimiLogger} logger
     */
    constructor(message, prefix, logger) {
        this.message = message;
        this.prefix = prefix;
        this.logger = logger;
    }
}

export { PipimiCommand, PipimiContext };