
/**
 * @callback MessageProducerCallback
 * @returns {string}
 */

/**
 * @typedef {MessageProducerCallback|string} MessageProducer
 */

/**
 * @abstract
 */
class PipimiLogger {
    _unimplemented() {
        throw new Error("Unimplemented");
    }

    _produce(producer) {
        if (typeof producer === "function") {
            return String(producer());
        }
        return String(producer);
    }

    /**
     * @param {MessageProducer} producer 
     */
    error(producer) {
        this._unimplemented();
    }

    /**
     * @param {MessageProducer} producer 
     */
    warn(producer) {
        this._unimplemented();
    }

    /**
     * @param {MessageProducer} producer 
     */
    info(producer) {
        this._unimplemented();
    }

    /**
     * @param {MessageProducer} producer 
     */
    debug(producer) {
        this._unimplemented();
    }

    /**
     * @param {MessageProducer} producer 
     */
    trace(producer) {
        this._unimplemented();
    }
}

class GranularityLogger extends PipimiLogger {
    static ERROR = 10;
    static WARN = 20;
    static INFO = 30;
    static DEBUG = 40;
    static TRACE = 50;

    constructor(granularity, delegate) {
        super();
        this.granularity = granularity;
        this.delegate = delegate;
    }

    _log(granularity, operation) {
        if (this.granularity >= granularity) {
            operation(this.delegate);
        }
    }

    error(producer) {
        this._log(GranularityLogger.ERROR, delegate => { delegate.error(producer) });
    }

    warn(producer) {
        this._log(GranularityLogger.WARN, delegate => { delegate.warn(producer) });
    }

    info(producer) {
        this._log(GranularityLogger.INFO, delegate => { delegate.info(producer) });
    }

    debug(producer) {
        this._log(GranularityLogger.DEBUG, delegate => { delegate.debug(producer) });
    }

    trace(producer) {
        this._log(GranularityLogger.TRACE, delegate => { delegate.trace(producer) });
    }
}

class ConsoleLogger extends PipimiLogger {
    _log(producer, operation) {
        operation(this._produce(producer));
    }

    error(producer) {
        this._log(producer, message => { console.error(message) });
    }

    warn(producer) {
        this._log(producer, message => { console.warn(message) });
    }

    info(producer) {
        this._log(producer, message => { console.info(message) });
    }

    debug(producer) {
        this._log(producer, message => { console.debug(message) });
    }

    trace(producer) {
        this._log(producer, message => { console.trace(message) });
    }
}

class ChannelLogger extends PipimiLogger {
    constructor(channel) {
        super();
        this.channel = channel;
    }

    async _log(prefix, producer) {
        try {
            await this.channel.send(`[${prefix}] ${this._produce(producer)}`);
        } catch (e) {
            console.error("Could not send log to channel", e);
        }
    }

    error(producer) {
        this._log("ERROR", producer);
    }

    warn(producer) {
        this._log("WARN", producer);
    }

    info(producer) {
        this._log("INFO", producer);
    }

    debug(producer) {
        this._log("DEBUG", producer);
    }

    trace(producer) {
        this._log("TRACE", producer);
    }
}

class CompositeLogger extends PipimiLogger {
    constructor(...delegates) {
        super();
        this.delegates = delegates;
    }

    _log(operation) {
        for (const delegate of this.delegates) {
            operation(delegate);
        }
    }

    error(producer) {
        this._log(delegate => { delegate.error(producer) });
    }

    warn(producer) {
        this._log(delegate => { delegate.warn(producer) });
    }

    info(producer) {
        this._log(delegate => { delegate.info(producer) });
    }

    debug(producer) {
        this._log(delegate => { delegate.debug(producer) });
    }

    trace(producer) {
        this._log(delegate => { delegate.trace(producer) });
    }
}

export { PipimiLogger, GranularityLogger, ConsoleLogger, ChannelLogger, CompositeLogger };