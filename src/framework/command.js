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

    async execute(context) {
        if (this.filter(context)) {
            try {
                return await this.handler(context);
            } catch (e) {
                return PipimiResponse.error(new Error(`Uncaught error in command '${this.name}': ` + JSON.stringify(e)));
            }
        }
        return PipimiResponse.noop();
    }

    /**
     * @param {string} prefix 
     * @param {Set<string>} roles 
     * @param {PrefixCommandHandler} handler 
     * @returns {PipimiCommand}
     */
    static standard(prefix, roles, handler) {
        return new PipimiCommand(
            prefix,
            context => 
                context.message.content.startsWith(prefix) &&
                (roles.size === 0 || context.message.member.roles.cache.some(role => roles.has(role))),
            context =>
                handler(context, context.message.content.substring(prefix.length))
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
     * @param {Error} error
     * @returns {PipimiResponse}
     */
    static error(error) {
        return new PipimiResponse(error.message, error, []);
    }

    /**
     * @returns {PipimiResponse}
     */
    static noop() {
        return new PipimiResponse(null, null, []);
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