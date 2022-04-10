import JishoAPI from "unofficial-jisho-api";
import { PipimiCommand, PipimiResponse } from "./framework/command.js";

/**
 * @return {PipimiCommand[]}
 */
const getJishoCommands = () => {
    const api = new JishoAPI();

    /** @type {import("./framework/command.js").PrefixCommandHandler} */
    const phrase = (_, args) => handlePhraseCommand(api, args.trim());
    /** @type {import("./framework/command.js").PrefixCommandHandler} */
    const kanji = (_, args) => handleKanjiCommand(api, args.trim()[0]);

    return [
        PipimiCommand.standard("!ji", new Set(), phrase),
        PipimiCommand.standard("!kanji", new Set(), kanji)
    ];
};

/**
 * @param {JishoAPI} api
 * @param {string} phrase 
 * @returns {PipimiResponse}
 */
const handlePhraseCommand = async (api, phrase) => {
    if (!phrase) {
        return PipimiResponse.success("Query is empty.");
    }

    /** @type {import("unofficial-jisho-api").JishoAPIResult} */
    let apiResponse;
    try {
        apiResponse = await api.searchForPhrase(phrase);
    } catch (e) {
        return PipimiResponse.error(new Error("Jisho API error: " + JSON.stringify(e)));
    }

    const { meta, data } = apiResponse;

    if (meta.status !== 200) {
        return PipimiResponse.error(new Error("Got non 200 from API: " + meta.status));
    }

    if (data.length === 0) {
        return PipimiResponse.success(`No results for phrase '${phrase}'.`);
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

    return PipimiResponse.success(parts.join("\n\n"));
};

/**
 * @param {JishoAPI} api
 * @param {string} kanji 
 * @returns {PipimiResponse}
 */
const handleKanjiCommand = async (api, kanji) => {
    if (!kanji) {
        return PipimiResponse.success("Query is empty.");
    }

    /** @type {import("unofficial-jisho-api").KanjiParseResult} */
    let apiResponse;
    try {
        apiResponse = await api.searchForKanji(kanji);
    } catch (e) {
        return PipimiResponse.error(new Error("Jisho API error: " + JSON.stringify(e)));
    }

    const entry = apiResponse;

    if (!entry.found) {
        return PipimiResponse.success(`Did not find kanji '${kanji}'.`);
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

    return PipimiResponse.success(parts.join("\n"));
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
