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
     * @param {string} name 
     * @param {string[]} allowedRoles 
     * @param {PrefixCommandHandler} handler 
     * @returns {PipimiCommand}
     */
    static standard(name, allowedRoles, handler) {
        const allowedRolesSet = new Set(allowedRoles);
        const regExp = new RegExp(`^(${Utils.escapeRegExp(name)}\\s)`);

        return new PipimiCommand(name, async context => {
            const { message, prefix } = context;
            const { content, member } = message;

            if (content.substring(0, prefix.length) != prefix) {
                return context;
            }

            const unprefixed = content.substring(prefix.length);
            const match = unprefixed.match(regExp);

            if (!match) {
                return context;
            }

            if (allowedRolesSet.size > 0 && !member.roles.cache.some(role => allowedRolesSet.has(role.name))) {
                return context;
            }

            const args = unprefixed.substring(match[1].length);
            return await handler(context, args);
        });
    }

    /**
     * @param {PipimiCommand[]} commands 
     * @param {PipimiContext} initial
     * @returns {Promise<PipimiContext>}
     */
    static async execute(commands, initial) {
        let context = initial;
        for (const command of commands) {
            try {
                const next = await command.handler(context);
                if (next) {
                    context = next;
                } else {
                    console.error(`Command '${command.name}' did not return a context`);
                }
            } catch (e) {
                console.error(`Error handling command '${command.name}'`, e);
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