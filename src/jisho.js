import { Message, MessageEmbed } from "discord.js";
import JishoAPI from "unofficial-jisho-api";

const JISHO_API = new JishoAPI();

/**
 * @param {Message} message 
 */
const handleJishoCommand = message => {
    const { content } = message;
    const [command, args] = content.split(" ", 2);

    switch (command) {
        case "!ji":
        case "!jisho":
            handlePhraseCommand(message, args);
            break;
        case "!kanji":
            handleKanjiCommand(message, args);
            break;
    }
};

/**
 * @param {Message} message 
 * @param {string} args 
 */
const handlePhraseCommand = async (message, args) => {
    const phrase = args.trim();
    const { meta, data } = await JISHO_API.searchForPhrase(phrase);

    if (meta.status !== 200) {
        console.error("got non-200 from jisho api", meta.status);
        return;
    }

    const results = [];

    for (const entry of data.slice(0, 3)) {
        const lines = [];

        lines.push(`**Expression**: ${entry.slug}`);

        if (entry.senses.length === 1) {
            lines.push(`**Meaning**: ${entry.senses[0].english_definitions.join(", ")}`);
        } else if (entry.senses.length > 1) {
            lines.push("**Meanings**:")
            for (const sense of entry.senses) {
                lines.push(`- ${sense.english_definitions.join(", ")}`);
            }
        }

        if (entry.japanese.length > 0) {
            const readings = entry.japanese.map(pair => pair.word ? `${pair.word} [${pair.reading}]` : `[${pair.reading}]`).join(", ");
            lines.push(`**Readings**: ${readings}`);
        }

        results.push(lines.join("\n"));
    }

    try {
        await message.channel.send(results.join("\n\n"));
    } catch (e) {
        console.error("could not send phrase results", results);
    }
};

/**
 * @param {Message} message 
 * @param {string} args 
 */
const handleKanjiCommand = async (message, args) => {
    const kanji = args.trim()[0];
    const entry = await JISHO_API.searchForKanji(kanji);
    const lines = [];

    if (entry.found) {
        lines.push(`**${kanji}** <${entry.uri}>`);
        if (entry.meaning) {
            lines.push(`**Meaning**: ${entry.meaning}`);
        }
        if (entry.kunyomi.length > 0) {
            let line = `**Kunyomi**: ${entry.kunyomi.join(", ")}`;
            if (entry.kunyomiExamples.length > 0) {
                const examples = entry.kunyomiExamples.map(def => `${def.example} [${def.reading}]`).join(', ');
                line += ` (examples: ${examples})`;
            }
            lines.push(line);
        }
        if (entry.onyomi.length > 0) {
            let line = `**Onyomi**: ${entry.onyomi.join(", ")}`;
            if (entry.onyomiExamples.length > 0) {
                const examples = entry.onyomiExamples.map(def => `${def.example} [${def.reading}]`).join(', ');
                line += ` (examples: ${examples})`;
            }
            lines.push(line);
        }
        if (entry.strokeOrderGifUri) {
            lines.push(`**Stroke order**: ${entry.strokeOrderGifUri}`);
        }
    } else {
        lines.push(`Did not find ${kanji}`);
    }

    try {
        await message.channel.send(lines.join("\n"));
    } catch (e) {
        console.error("could not send kanji result", result);
    }
};

export { handleJishoCommand };
