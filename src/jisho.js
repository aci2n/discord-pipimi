import { Message, TextChannel } from "discord.js";
import JishoAPI from "unofficial-jisho-api";

const JISHO_API = new JishoAPI();
const COMMANDS = [
    { prefixes: ["!ji", "!jisho"], handler: (channel, message) => handlePhraseCommand(channel, message) },
    { prefixes: ["!kanji"], handler: (channel, message) => handleKanjiCommand(channel, message) }
]

/**
 * @param {Message} message 
 */
const handleJishoCommand = async message => {
    const { content } = message;

    for (const command of COMMANDS) {
        for (const prefix of command.prefixes) {
            if (content.startsWith(prefix)) {
                const args = content.substring(prefix.length);
                await command.handler(message.channel, args);
                return;
            }
        }
    }
};

/**
 * @param {TextChannel} channel 
 * @param {string} phrase 
 */
const handlePhraseCommand = async (channel, args) => {
    const phrase = args.trim();

    if (!phrase) {
        console.log("ignoring empty phrase search");
        return;
    }

    const { meta, data } = await JISHO_API.searchForPhrase(phrase);

    if (meta.status !== 200) {
        console.error("got non-200 from jisho api", meta.status);
        return;
    }

    const output = [];

    if (data.length === 0) {
        output.push(`No results for phrase '${phrase}'.`);
    }

    for (const entry of data.slice(0, 3)) {
        const lines = [];
        const url = `https://jisho.org/word/${entry.slug}`;

        lines.push(`**Expression**: ${entry.slug} <${url}>`);

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

        output.push(lines.join("\n"));
    }

    await channel.send(output.join("\n\n"));
};

/**
 * @param {TextChannel} channel 
 * @param {string} args 
 */
const handleKanjiCommand = async (channel, args) => {
    const kanji = args.trim()[0];

    if (!kanji) {
        console.log("ignoring empty kanji search");
        return;
    }

    const entry = await JISHO_API.searchForKanji(kanji);
    const lines = [];

    if (entry.found) {
        lines.push(`**Kanji**: ${kanji} <${entry.uri}>`);
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
        if (entry.parts.length > 0) {
            lines.push(`**Parts**: ${entry.parts.join(", ")}`);
        }
        if (entry.strokeOrderGifUri) {
            lines.push(`**Stroke order**: ${entry.strokeOrderGifUri}`);
        }
    } else {
        lines.push(`Did not find kanji '${kanji}'.`);
    }

    await channel.send(lines.join("\n"));
};

export { handleJishoCommand };
