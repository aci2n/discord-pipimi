class Session {
    /**
     * @typedef {Object} SessionBuilder
     * @property {(import("./dictionary").Word|null)} challenge
     * @property {number} streak
     */

    /**
     * @constructor
     * @param {SessionBuilder} param0 
     */
    constructor({ challenge, streak }) {
        this.challenge = challenge;
        this.streak = streak;
        Object.freeze(this);
    }
};

export { Session };