import { PipimiCommand, PipimiContext } from "../../framework/command.js";
import { getDictionary } from "./dictionary.js";
import { KotobaSession, KotobaEvent } from "./session.js";
import { env } from "process";

/**
 * @return {PipimiCommand[]}
 */
const getKotobaCommands = () => {
    return [
        new PipimiCommand("kotoba", getKotobaHandler(getDictionary()))
    ];
};

/**
 * @param {import("./dictionary.js").Dictionary} dictionary
 */
const getKotobaHandler = dictionary => {
    /** @type {Map.<String, KotobaSession>} */
    const sessions = new Map();
    const prefix = env["PIPIMI_KOTOBA_PREFIX"] || "";
    const triggers = new Set(["koto", "kotoba", "言葉", "こと", "ことば"].map(trigger => prefix + trigger));
    const { words } = dictionary;
    const wordProvider = () => words[Math.floor(Math.random() * words.length)];

    /**
     * @param {PipimiContext} context
     * @returns {Promise<PipimiContext>}
     */
    return async context => {
        const { message } = context;
        const { author, content: answer, channel } = message;
        const { id: userId } = author;

        if (!sessions.has(userId) && !triggers.has(answer)) {
            return context;
        }

        const event = new KotobaEvent({ sessions, userId, answer, channel, wordProvider, timeout: false })
        await processEvent(event);

        return context;
    };
};

/**
 * @param {KotobaEvent} event 
 * @returns {Promise<{session: KotobaSession, message: string>}
 */
const processEvent = async event => {
    const { sessions, channel, userId } = event;
    const result = computeNextSession(event);

    if (result.session) {
        sessions.set(userId, result.session);
    } else {
        sessions.delete(userId);
    }

    await channel.send(result.message);

    return result;
};

/**
 * @param {KotobaEvent} event
 * @returns {{session: KotobaSession, message: string}
 */
const computeNextSession = event => {
    const session = event.sessions.get(event.userId);
    const mention = `<@${event.userId}>`;
    const scheduleTimeout = timeout => setTimeout(() => processEvent(new KotobaEvent({ ...event, timeout: true })), timeout);

    if (!session) {
        const challenge = event.wordProvider();
        const timeout = getTimeout(0);
        const timeoutId = scheduleTimeout(timeout);

        return {
            session: new KotobaSession({ challenge, streak: 0, timeoutId }),
            message: `Let's go ${mention}!\nWrite the kana for: ${formatWord(challenge)}\n*(you have ${timeout}ms)*`
        };
    }

    clearTimeout(session.timeoutId);

    const readings = session.challenge.kana.map(kana => kana.text);

    if (event.timeout) {
        return {
            session: null,
            message: `Time's up ${mention}!\nValid answers were: **${formatReadings(readings)}**`
        };
    }

    if (readings.some(reading => reading === event.answer)) {
        const challenge = event.wordProvider();
        const streak = session.streak + 1;
        const otherReadings = readings.filter(reading => reading !== event.answer);
        const timeout = getTimeout(streak);
        const timeoutId = scheduleTimeout(timeout);
        let message = `Correct ${mention}!`;

        if (otherReadings.length > 0) {
            message += ` Other valid answers were: ${formatReadings(otherReadings)}`
        }
        message += `\nNow write the kana for: ${formatWord(challenge)}`;
        message += `\n*(you have ${timeout}ms)*`;

        return { session: new KotobaSession({ challenge, streak, timeoutId }), message };
    }

    return {
        session: null,
        message: `Wrong ${mention}!\nValid answers were **${formatReadings(readings)}**\nYour streak was: **${session.streak}**!`
    };
};

/**
 * @param {number} streak 
 * @returns {number}
 */
const getTimeout = streak => {
    return Math.max(5000, 12000 - streak * 200);
};

/**
 * @param {import("./dictionary.js").Word} word 
 * @returns {string}
 */
const formatWord = (word) => {
    let str = "";
    const mainKanji = word.kanji[0];

    str += `**${mainKanji.text}**`;

    const otherKanji = word.kanji.slice(1);
    if (otherKanji.length > 0) {
        str += ` *(other forms: ${otherKanji.map(kanji => `${kanji.text}`).join(", ")})*`;
    }

    const senses = word.sense;
    if (senses.length > 0) {
        str += `\nMeanings:`;
        for (const sense of senses) {
            str += `\n\t- ${sense.gloss.map(gloss => gloss.text).join(", ")}`;
        }
    }

    return str;
};

/**
 * @param {string[]} readings 
 * @returns {string}
 */
const formatReadings = readings => {
    return readings.map(reading => `[${reading}]`).join(", ");
};

export { getKotobaCommands };
