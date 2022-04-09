import { Message } from "discord.js";

/**
 * @callback CommandFilter
 * @param {Message} message
 */

/**
 * @callback CommandHandler
 * @param {Message} message
 * @return {Promise<*>}
 */

/**
 * @callback PrefixCommandHandler
 * @param {Message} message
 * @param {string} args 
 * @return {Promise<*>}
 */

class PipimiCommand {
    /**
     * @param {CommandFilter} filter 
     * @param {CommandHandler} handler 
     */
    constructor(filter, handler) {
        this.filter = filter;
        this.handler = handler;
    }

    /**
     * @param {Message} message 
     */
    async evaluate(message) {
        if (this.filter(message)) {
            return await this.handler(message);
        }
    }

    /**
     * @param {string} prefix 
     * @param {PrefixCommandHandler} handler
     */
    static prefixCommand(prefix, handler) {
        /** @type {CommandFilter} */
        const filter = message => message.content.startsWith(prefix);
        /** @type {CommandHandler} */
        const wrapper = message => {
            const args = message.content.substring(prefix);
            return handler(message, args);
        };
        return new PipimiCommand(filter, wrapper);
    }
}