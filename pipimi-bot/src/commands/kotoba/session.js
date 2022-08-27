import { Channel } from "discord.js";

class KotobaSession {
    /**
     * @typedef {Object} SessionBuilder
     * @property {(import("./dictionary").Word|null)} challenge
     * @property {number} streak
     * @property {number} timeoutId
     */

    /**
     * @constructor
     * @param {SessionBuilder} param0 
     */
    constructor({ challenge, streak, timeoutId }) {
        this.challenge = challenge;
        this.streak = streak;
        this.timeoutId = timeoutId;
        Object.freeze(this);
    }
};

class KotobaEvent {
    /**
     * @constructor
     * @param {Object} obj 
     * @param {Map.<string,KotobaSession>} obj.sessions 
     * @param {string} obj.userId 
     * @param {Channel} obj.channel 
     * @param {string} obj.answer 
     * @param {() => import("./dictionary").Word} obj.wordProvider 
     * @param {boolean} obj.timeout
     */
    constructor({ sessions, userId, channel, answer, wordProvider, timeout }) {
        this.sessions = sessions;
        this.userId = userId;
        this.channel = channel;
        this.answer = answer;
        this.wordProvider = wordProvider;
        this.timeout = timeout;
        Object.freeze(this);
    }
}

export { KotobaSession, KotobaEvent };