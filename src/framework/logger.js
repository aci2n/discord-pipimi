import { TextChannel } from "discord.js";

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
     * @callback MessageConsumer
     * @param {MessageSupplier} message 
     */

    /**
     * @callback LogLevelToMessageConsumerMapper
     * @param {LogLevel} level 
     * @returns {MessageConsumer}
     */

    /**
     * @constructor
     * @param {LogLevelToMessageConsumerMapper} mapper 
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
     */
    error(message) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     */
    warn(message) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     */
    info(message) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     */
    debug(message) {
        this._unimplemented();
    }

    /**
     * @param {MessageSupplier} message 
     */
    trace(message) {
        this._unimplemented();
    }
}

class PriorityLogger extends PipimiLogger {
    /**
     * @param {LogLevel} peak 
     * @param {PipimiLogger} delegate 
     */
    constructor(peak, delegate) {
        super(level => peak.priority >= level.priority ? message => { delegate[level.name](message) } : () => { });
    }
}

class ConsoleLogger extends PipimiLogger {
    constructor() {
        super(level => message => { console[level.name](message()) });
    }
}

class ChannelLogger extends PipimiLogger {
    /**
     * @param {TextChannel} channel 
     */
    constructor(channel) {
        super(level => async message => {
            try {
                await channel.send(`[${level.name.toLocaleUpperCase()}] ${message()}`);
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
        super(level => message => { delegates.forEach(delegate => delegate[level.name](message)) });
    }
}

export { PipimiLogger, PriorityLogger, ConsoleLogger, ChannelLogger, CompositeLogger, LogLevel };