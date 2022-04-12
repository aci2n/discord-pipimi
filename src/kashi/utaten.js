import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import process from 'process';
import axios from 'axios';

const ORIGIN = "https://utaten.com";
const SEARCH_PATH = "/lyric/search";

class UtatenQuery {
    /**
     * @param {string} title 
     * @param {string} artist 
     */
    constructor(title, artist) {
        this.title = title;
        this.artist = artist;
        Object.freeze(this);
    }

    /**
     * @param {string} string 
     * @returns {UtatenQuery}
     */
    static fromString(string) {
        const query = {};
        const tokens = string.split("|");
        for (const token of tokens) {
            const colon = token.indexOf(":");
            if (colon === -1) {
                query.title = token;
            } else {
                const key = token.substring(0, colon);
                const value = token.substring(colon + 1);
                query[key] = value;
            }
        }
        return new UtatenQuery(query.title, query.artist);
    }
}

class UtatenSearchResult {
    /**
     * @param {string} title 
     * @param {string} artist 
     * @param {string} preview 
     * @param {string} lyricsUrl 
     * @param {string} artistUrl 
     */
    constructor(title, artist, preview, lyricsUrl, artistUrl) {
        this.title = title;
        this.artist = artist;
        this.preview = preview;
        this.lyricsUrl = lyricsUrl;
        this.artistUrl = artistUrl;
        Object.freeze(this);
    }
}

class UtatenLyrics {
    /**
     * @param {string} title 
     * @param {string} artist 
     * @param {string} lyrics 
     * @param {string} coverUrl 
     * @param {string} artistUrl 
     */
    constructor(title, artist, lyrics, artistUrl, coverUrl) {
        this.title = title;
        this.artist = artist;
        this.lyrics = lyrics;
        this.artistUrl = artistUrl;
        this.coverUrl = coverUrl;
        Object.freeze(this);
    }
}

/**
 * @param {string} url 
 * @returns {Promise<JSDOM>}
 */
const fetchDom = async url => {
    const response = await axios.get(url);
    return new JSDOM(response.data);
};

/**
 * @param {string} url 
 * @returns {Promise<UtatenLyrics>}
 */
const fetchLyrics = async url => {
    const dom = await fetchDom(url);
    const document = dom.window.document;
    const titleNode = document.querySelector(".newLyricTitle__main").childNodes[0];
    const lyricsNode = document.querySelector(".hiragana");
    const coverNode = document.querySelector(".lyricData__sub img");
    const artistNode = document.querySelector(".newLyricWork__name a");

    // clean furigana
    Array.from(lyricsNode.querySelectorAll(".rt")).forEach(furigana => furigana.textContent = "");

    const titleWithQuotes = titleNode.textContent.trim();
    const title = titleWithQuotes.substring(1, titleWithQuotes.length - 1);
    const lyrics = lyricsNode.textContent.trim();
    const artist = artistNode.textContent.trim();
    const artistUrl = artistNode.href.trim();
    const coverUrl = coverNode.src.trim();

    return new UtatenLyrics(title, artist, lyrics, artistUrl, coverUrl);
};

/**
 * @param {UtatenQuery} query 
 * @returns {Promise<UtatenSearchResult[]>}
 */
const searchLyrics = async query => {
    const params = new URLSearchParams();
    if (query.title) params.append("title", query.title);
    if (query.artist) params.append("artist_name", query.artist);
    const dom = await fetchDom(`${ORIGIN}${SEARCH_PATH}?${params.toString()}`);

    return Array.from(dom.window.document.querySelectorAll(".searchResult__title"))
        .map(node => node.parentElement.parentElement)
        .map(container => {
            const titleNode = container.querySelector(".searchResult__title a");
            const artistNode = container.querySelector(".searchResult__name a");
            const previewNode = container.querySelector(".lyricList__beginning a");
            const title = titleNode.textContent.trim();
            const artist = artistNode.textContent.trim();
            const preview = previewNode.textContent.trim();
            const lyricsUrl = ORIGIN + titleNode.href.trim();
            const artistUrl = ORIGIN + artistNode.href.trim();
            return new UtatenSearchResult(title, artist, preview, lyricsUrl, artistUrl);
        });
};

const main = async argv => {
    const string = argv[2];
    const json = JSON.parse(string);
    const query = new UtatenQuery(json.title, json.artist);
    const search = await searchLyrics(query);
    const lyrics = await fetchLyrics(search[0].lyricsUrl);
    console.log(JSON.stringify(lyrics.lyrics, null, 2));
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main(process.argv);
}
