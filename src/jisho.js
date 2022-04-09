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
            const readings = entry.japanese.map(pair => `${pair.word} [${pair.reading}]`).join(", ");
            lines.push(`**Readings**: ${readings}`);
        }

        results.push(lines.join("\n"));
    }

    try {
        await message.channel.send(results.join("\n\n"));
    } catch (e) {
        console.log("could not send phrase results", results);
    }
};

/**
 * @param {Message} message 
 * @param {string} args 
 */
const handleKanjiCommand = async (message, args) => {
    const kanjis = args.trim().substring(0, 3);

    for (const kanji of kanjis) {
        const result = await JISHO_API.searchForKanji(kanji);
        // message.channel.send(JSON.stringify(result));
    }
};

export { handleJishoCommand };
