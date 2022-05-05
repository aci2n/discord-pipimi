import dictionary from "./dictionary.json" assert {type: "json"};;
import { argv } from "process";
import { fileURLToPath } from "url";

/**
 * @typedef {Object} Dictionary
 * @property {string} version
 * @property {string} dictDate
 * @property {string[]} dictRevisions
 * @property {Object.<string,string>} tags
 * @property {Word[]} words
 */

/**
 * @typedef {Object} Word
 * @property {string} id
 * @property {Kanji[]} kanji
 * @property {Kana[]} kana
 * @property {Sense[]} sense
 */

/**
 * @typedef {Object} Kanji
 * @property {boolean} common
 * @property {string} text
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Kana
 * @property {boolean} common
 * @property {string} text
 * @property {string[]} tags
 * @property {string[]} appliesToKanji
 */

/**
 * @typedef {Object} Sense
 * @property {string[]} partOfSpeech
 * @property {string[]} appliesToKanji
 * @property {string[]} appliesToKana
 * @property {string[]} related
 * @property {string[]} antonym
 * @property {string[]} field
 * @property {string[]} dialect
 * @property {string[]} misc
 * @property {string[]} info
 * @property {string[]} languageSource
 * @property {Glossary[]} gloss
 */

/**
 * @typedef {Object} Glossary
 * @property {null} type
 * @property {string} lang
 * @property {string} text
 */

/**
 * @returns {Dictionary}
 */
const getDictionary = () => dictionary;

const formatDictionary = path => {
    const contents = readFileSync(path);
    /** @type {Dictionary} */
    const dictionary = JSON.parse(contents);
    const words = dictionary.words.filter(word => word.kanji.length > 0 && word.kana.length > 0);
    const formatted = { ...dictionary, words };
    console.log(JSON.stringify(formatted, null, 2));
};

if (argv[1] === fileURLToPath(import.meta.url)) {
    formatDictionary(argv[2]);
}

export { getDictionary };