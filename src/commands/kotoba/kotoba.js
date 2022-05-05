import { PipimiCommand, PipimiContext } from "../../framework/command.js";
import { getDictionary } from "./dictionary.js";
import { Session } from "./session.js";

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
    /** @type {Map.<String, Session>} */
    const sessions = new Map();
    const triggers = new Set(["koto", "kotoba", "言葉", "こと", "ことば"]);
    const { words } = dictionary;
    const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

    /**
     * @param {PipimiContext} context
     * @returns {Promise<PipimiContext>}
     */
    return async context => {
        const { message } = context;
        const { channel, author, content } = message;
        const { id: userId } = author;

        if (!sessions.has(userId) && !triggers.has(content)) {
            return context;
        }

        const session = sessions.get(userId);
        const result = computeNextSession(context, session, getRandomWord);

        if (result.session) {
            sessions.set(userId, result.session);
        } else {
            sessions.delete(userId);
        }

        await channel.send(result.message);

        return context;
    };
};

/**
 * @param {PipimiContext} context
 * @param {Session} session 
 * @param {() => Word} getRandomWord
 * @returns {{session: Session, message: string}
 */
const computeNextSession = (context, session, getRandomWord) => {
    const { message } = context;
    const { content: answer, author } = message;
    const mention = `<@${author.id}>`;

    if (!session) {
        const challenge = getRandomWord();
        return {
            session: new Session({ challenge, streak: 0 }),
            message: `Let's go ${mention}!\nWrite the kana for: ${formatWord(challenge)}`
        };
    }

    const readings = session.challenge.kana.map(kana => kana.text);

    if (readings.some(reading => reading === answer)) {
        const challenge = getRandomWord();
        const streak = session.streak + 1;
        const otherReadings = readings.filter(reading => reading !== answer);
        let message = `Correct ${mention}!`;

        if (otherReadings.length > 0) {
            message += ` Other valid answers were: ${formatReadings(otherReadings)}`
        }
        message += `\nNow write the kana for: ${formatWord(challenge)}`;

        return { session: new Session({ challenge, streak }), message };
    }

    return {
        session: null,
        message: `Wrong ${mention}!\nValid answers were **${formatReadings(readings)}**\nYour streak was: **${session.streak}**!`
    };
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
