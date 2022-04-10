import { Message, MessageEmbed } from "discord.js";
import { Utils } from "./utils.js";

class PipimiCommand {
    /**
     * @callback CommandHandler
     * @param {PipimiContext} context
     * @return {Promise<PipimiResponse>}
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
     * @param {PipimiContext} context 
     */
    async evaluate(context) {
        const response = await this.execute(context);
        try {
            await response.handler(context);
        } catch (e) {
            console.error(`Error handling response for command '${this.name}'`, e);
        }
        return response;
    }

    /**
     * @param {PipimiContext} context 
     * @returns {Promise<PipimiResponse>}
     */
    async execute(context) {
        try {
            return await this.handler(context);
        } catch (e) {
            return PipimiResponse.error(`Uncaught error in command '${this.name}'`, e);
        }
    }

    /**
     * @callback PrefixCommandHandler
     * @param {PipimiContext} context
     * @param {string} args 
     * @return {Promise<PipimiResponse>}
     */

    /**
     * @param {string} name 
     * @param {string[]} allowedRoles 
     * @param {PrefixCommandHandler} handler 
     * @returns {PipimiCommand}
     */
    static standard(name, allowedRoles, handler) {
        const allowedRolesSet = new Set(allowedRoles);
        const regExp = new RegExp(`^(${Utils.escapeRegExp(name)})\\s(.*)$`);

        return new PipimiCommand(name, async context => {
            const { message, prefix } = context;
            const { content, member } = message;

            if (content.substring(0, prefix.length) != prefix) {
                return PipimiResponse.empty();
            }

            const match = content.substring(prefix.length, content.length).match(regExp);

            if (!match) {
                return PipimiResponse.empty();
            }

            if (allowedRolesSet.size > 0 && !member.roles.cache.some(role => allowedRolesSet.has(role.name))) {
                return PipimiResponse.empty();
            }

            return await handler(context, match[2]);
        });
    }
}

class PipimiResponse {
    /**
     * @callback ResponseHandler
     * @param {PipimiContext} context
     * @return {Promise<*>}
     */

    /** 
     * @constructor
     * @param {ResponseHandler} handler
     */
    constructor(handler) {
        this.handler = handler;
    }

    /**
     * @param  {string|MessageEmbed} message 
     * @returns {PipimiResponse}
     */
    static send(message) {
        return new PipimiResponse(async context => {
            await context.message.channel.send(message);
        });
    }

    /**
     * @param {string} message
     * @param {Error|null} error
     * @returns {PipimiResponse}
     */
    static error(message, error) {
        return new PipimiResponse(async context => {
            const err = error || new Error();
            const msg = `${message} (${err})`;
            console.error(`Handled error in command ${this.name}`, err);
            await context.message.channel.send(msg);
        });
    }

    /**
    * @returns {PipimiResponse}
    */
    static delete() {
        return new PipimiResponse(async context => {
            await context.message.delete({ timeout: 0, reason: "deleted by pipimi" });
        });
    }

    /**
     * @returns {PipimiResponse}
     */
    static empty() {
        return new PipimiResponse(async () => { });
    }

    /**
     * @param {...PipimiResponse} responses
     * @returns {PipimiResponse}
     */
    static all(...responses) {
        return new PipimiResponse(async context => {
            await Promise.all(responses.map(response => response.handler(context)));
        });
    }
}

class PipimiContext {
    /**
     * @constructor
     * @param {Message} message 
     * @param {string} prefix
     */
    constructor(message, prefix) {
        this.message = message;
        this.prefix = prefix;
    }
}

export { PipimiCommand, PipimiResponse, PipimiContext };