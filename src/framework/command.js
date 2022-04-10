import { Message } from "discord.js";

/**
 * @callback CommandFilter
 * @param {PipimiContext} context
 */

/**
 * @callback CommandHandler
 * @param {PipimiContext} context
 * @return {Promise<PipimiResponse>}
 */

/**
 * @callback PrefixCommandHandler
 * @param {PipimiContext} context
 * @param {string} args 
 * @return {Promise<PipimiResponse>}
 */

class PipimiCommand {
    /**
     * @constructor
     * @param {string} name
     * @param {CommandFilter} filter 
     * @param {CommandHandler} handler 
     */
    constructor(name, filter, handler) {
        this.name = name;
        this.filter = filter;
        this.handler = handler;
    }

    /**
     * @param {PipimiContext} context 
     */
    async evaluate(context) {
        const response = await this.execute(context);
        try {
            await response.write(context);
        } catch (e) {
            console.error(`Error writing response for command '${this.name}'`, e);
        }
        return response;
    }

    /**
     * @param {PipimiContext} context 
     * @returns {Promise<PipimiResponse>}
     */
    async execute(context) {
        if (this.filter(context)) {
            try {
                return await this.handler(context);
            } catch (e) {
                return PipimiResponse.error(`Uncaught error in command '${this.name}'`, e);
            }
        }
        return PipimiResponse.empty();
    }

    /**
     * @param {string} prefix 
     * @param {string[]} allowedRoles 
     * @param {PrefixCommandHandler} handler 
     * @returns {PipimiCommand}
     */
    static standard(prefix, allowedRoles, handler) {
        const allowedRolesSet = new Set(allowedRoles);

        return new PipimiCommand(
            prefix,
            context => {
                const { message } = context;
                const { content } = message;
                const roles = message.member.roles.cache;

                if (!content.startsWith(prefix)) {
                    return false;
                }
                if (allowedRolesSet.size === 0) {
                    return true;
                }
                return roles.some(role => allowedRolesSet.has(role.name));
            },
            context => {
                return handler(context, context.message.content.substring(prefix.length))
            }
        )
    }
}

class PipimiResponse {
    /** 
     * @constructor
     * @param {string|null} message
     * @param {Error|null} error
     * @param {PipimiResponse[]} children
     */
    constructor(message, error, children) {
        this.message = message;
        this.error = error;
        this.children = children;
    }

    /**
     * @param {PipimiContext} context
     */
    async write(context) {
        if (this.error) {
            console.log(`Handled error inside command ${this.name}`, this.error);
        }
        if (this.message) {
            await context.message.channel.send(this.message);
        }
        for (const child of this.children) {
            await child.write(context);
        }
    }

    /**
     * @param  {string} message 
     * @returns {PipimiResponse}
     */
    static success(message) {
        return new PipimiResponse(message, null, []);
    }

    /**
     * @param {string} message
     * @param {Error|null} error
     * @returns {PipimiResponse}
     */
    static error(message, error) {
        error = error || new Error();
        return new PipimiResponse(message + ` (${error})`, error, []);
    }

    /**
     * @returns {PipimiResponse}
     */
    static empty() {
        return new PipimiResponse(null, null, []);
    }

    /**
     * @param {...PipimiResponse} responses
     * @returns {PipimiResponse}
     */
    static compose(...responses) {
        return new PipimiResponse(null, null, responses);
    }
}

class PipimiContext {
    /**
     * @constructor
     * @param {Message} message 
     */
    constructor(message) {
        this.message = message;
    }
}

export { PipimiCommand, PipimiResponse, PipimiContext };