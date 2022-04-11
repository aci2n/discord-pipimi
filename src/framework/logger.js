import { TextChannel } from "discord.js";
import { Utils } from "./utils.js";

class LogLevel {
    /**
     * @type {Object<string, LogLevel>}
     */
    static LEVELS = ["error", "warn", "info", "debug", "trace"].reduce((levels, name, priority) => {
        levels[name.toUpperCase()] = new LogLevel(name, priority);
        return levels;
    }, Object.create(null));

    /**
     * @param {("error"|"warn"|"info"|"debug"|"trace")} name 
     * @param {number} priority 
     */
    constructor(name, priority) {
        this.name = name;
        this.priority = priority;
    }
}

class PipimiLogger {
    /**
     * @callback MessageSupplier
     * @returns {string}
     */

    /**
     * @callback LogFunction
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     * @returns {undefined} 
     */

    /**
     * @callback LogLevelToFunctionMapper
     * @param {LogLevel} level 
     * @returns {LogFunction}
     */

    /**
     * @constructor
     * @param {LogLevelToFunctionMapper} mapper 
     */
    constructor(mapper) {
        for (const level of Object.values(LogLevel.LEVELS)) {
            this[level.name] = mapper(level);
        }
    }

    _unimplemented() {
        throw new Error("Unimplemented");
    }

    /**
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     */
    error(message, ...objects) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     */
    warn(message, ...objects) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     */
    info(message, ...objects) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     */
    debug(message, ...objects) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     * @param {...Object} objects 
     */
    trace(message, ...objects) {
        this._unimplemented();
    }
}

class PriorityLogger extends PipimiLogger {
    /**
     * @param {LogLevel} peak 
     * @param {PipimiLogger} delegate 
     */
    constructor(peak, delegate) {
        super(level => peak.priority >= level.priority ? (message, ...objects) => {
            delegate[level.name](message, ...objects);
        } : () => { });
    }
}

class ConsoleLogger extends PipimiLogger {
    constructor() {
        super(level => (message, ...objects) => {
            console[level.name](message(), ...objects);
        });
    }
}

class ChannelLogger extends PipimiLogger {
    /**
     * @param {TextChannel} channel 
     */
    constructor(channel) {
        super(level => async (message, ...objects) => {
            /** @type {string[]} */
            const parts = [];

            parts.push(`[${level.name.toLocaleUpperCase()}]`);
            parts.push(message());

            if (objects.length > 0) {
                const objs = objects.map(obj => `\`${Utils.truncate(JSON.stringify(obj), 50, "…")}\``).join(", ");
                parts.push(`[${objs}]`);
            }

            try {
                await channel.send(parts.join(" "));
            } catch (e) {
                console.error("Could not send log to channel", e);
            }
        });
    }
}

class CompositeLogger extends PipimiLogger {
    /**
     * @param  {...PipimiLogger} delegates 
     */
    constructor(...delegates) {
        super(level => (message, ...objects) => {
            for (const delegate of delegates) {
                delegate[level.name](message, ...objects);
            }
        });
    }
}

export { PipimiLogger, PriorityLogger, ConsoleLogger, ChannelLogger, CompositeLogger, LogLevel };