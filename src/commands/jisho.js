import JishoAPI from "unofficial-jisho-api";
import { PipimiCommand, PipimiContext } from "../framework/command.js";

/**
 * @return {PipimiCommand[]}
 */
const getJishoCommands = () => {
    const api = new JishoAPI();

    /** @type {import("../framework/command.js").PrefixCommandHandler} */
    const phrase = (context, args) => handlePhraseCommand(context, api, args.trim());
    /** @type {import("../framework/command.js").PrefixCommandHandler} */
    const kanji = (context, args) => handleKanjiCommand(context, api, args.trim()[0]);

    return [
        PipimiCommand.standard("ji", [], phrase),
        PipimiCommand.standard("kanji", [], kanji)
    ];
};

/**
 * @param {PipimiContext} context
 * @param {JishoAPI} api
 * @param {string} phrase 
 * @returns {Promise<PipimiContext>}
 */
const handlePhraseCommand = async (context, api, phrase) => {
    const { message, logger } = context;
    const { channel } = message;

    if (!phrase) {
        await channel.send("Query is empty.");
        return context;
    }

    /** @type {import("unofficial-jisho-api").JishoAPIResult} */
    let apiResponse;
    try {
        apiResponse = await api.searchForPhrase(phrase);
    } catch (e) {
        logger.error(() => `Jisho API error: ${e}`);
        await channel.send("Jisho API error.");
        return context;
    }

    const { meta, data } = apiResponse;

    if (meta.status !== 200) {
        logger.error("Got non 200 from API: " + meta.status);
        await channel.send("Jisho API error.");
        return context;
    }

    if (data.length === 0) {
        await channel.send(`No results for phrase '${phrase}'.`);
        return context;
    }

    /** @type {string[]} */
    const parts = [];

    for (const match of data.slice(0, 3)) {
        const lines = [];
        const url = `https://jisho.org/word/${match.slug}`;
        const readings = readingPairs(match.japanese);

        lines.push(`**Expression**: ${match.slug} <${url}>`);
        if (match.senses.length === 1) {
            lines.push(`**Meaning**: ${commaJoin(match.senses[0].english_definitions)}`);
        } else if (match.senses.length > 1) {
            lines.push("**Meanings**:")
            for (const sense of match.senses) {
                lines.push(`- ${commaJoin(sense.english_definitions)}`);
            }
        }
        if (readings.length > 0) {
            lines.push(`**Readings**: ${commaJoin(readings)}`);
        }
        parts.push(lines.join("\n"));
    }

    await channel.send(parts.join("\n\n"));
    return context;
};

/**
 * @param {PipimiContext} context
 * @param {JishoAPI} api
 * @param {string} kanji 
 * @returns {Promise<PipimiContext>}
 */
const handleKanjiCommand = async (context, api, kanji) => {
    const { message, logger } = context;
    const { channel } = message;

    if (!kanji) {
        logger.debug("Got empty query");
        await channel.send("Query is empty.");
        return context;
    }

    /** @type {import("unofficial-jisho-api").KanjiParseResult} */
    let apiResponse;
    try {
        apiResponse = await api.searchForKanji(kanji);
    } catch (e) {
        logger.error(() => `Jisho API error: ${e}`);
        await channel.send("Jisho API error.");
        return context;
    }

    const entry = apiResponse;

    if (!entry.found) {
        await channel.send(`Did not find kanji '${kanji}'.`);
        return context;
    }

    /** @type {string[]} */
    const parts = [];

    parts.push(`**Kanji**: ${kanji} <${entry.uri}>`);
    if (entry.meaning) {
        parts.push(`**Meaning**: ${entry.meaning}`);
    }
    if (entry.kunyomi.length > 0) {
        parts.push(readingsWithExamples("Kunyomi", entry.kunyomi, entry.kunyomiExamples));
    }
    if (entry.onyomi.length > 0) {
        parts.push(readingsWithExamples("Onyomi", entry.onyomi, entry.onyomiExamples));
    }
    if (entry.parts.length > 0) {
        parts.push(`**Parts**: ${commaJoin(entry.parts)}`);
    }
    if (entry.strokeOrderGifUri) {
        parts.push(`**Stroke order**: ${entry.strokeOrderGifUri}`);
    }

    await channel.send(parts.join("\n"));
    return context;
};

/**
 * @param {string} name 
 * @param {string[]} readings 
 * @param {{example: string|null, reading: string|null}[]} examples
 * @returns {string}
 */
const readingsWithExamples = (name, readings, examples) => {
    let line = `**${name}**: ${commaJoin(readings)}`;
    const exampleReadings = readingPairs(examples.map(def => ({ word: def.example, reading: def.reading })));
    if (exampleReadings.length > 0) {
        line += ` (examples: ${commaJoin(exampleReadings)})`;
    }
    return line;
}

/**
 * @param {{word: string|null, reading: string|null}[]} pairs
 * @returns {string[]}
 */
const readingPairs = pairs => {
    return pairs
        .map(({ word, reading }) => {
            /** @type {string[]} */
            const tokens = [];
            if (word) tokens.push(word);
            if (reading) tokens.push(`[${reading}]`);
            return tokens.join(' ');
        })
        .filter(result => result);
};

/**
 * @param {string[]} parts 
 * @returns {string}
 */
const commaJoin = parts => {
    return parts.join(", ");
};

export { getJishoCommands };
