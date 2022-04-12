import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import process from 'process';
import axios from 'axios';
import { ConsoleLogger, PipimiLogger } from '../framework/logger.js';

const ORIGIN = "https://utaten.com";
const SEARCH_PATH = "/lyric/search";
const QUERY_KEYS = ["title", "artist"];

class UtatenSearchQuery {
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
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this);
    }

    /**
     * @param {string} string 
     * @returns {UtatenSearchQuery}
     */
    static fromString(string) {
        const query = Object.create(null);
        const tokens = string.split(",").map(token => token.trim());

        for (const token of tokens) {
            const colon = token.indexOf(":");
            if (colon === -1) {
                for (const key of QUERY_KEYS) {
                    if (!query[key]) {
                        query[key] = token;
                        break;
                    }
                }
            } else {
                const key = token.substring(0, colon);
                const value = token.substring(colon + 1);
                query[key] = value;
            }
        }

        return new UtatenSearchQuery(query.title, query.artist);
    }
}

class UtatenSearchResult {
    /**
     * @param {string} title 
     * @param {string} artist 
     * @param {string} preview 
     * @param {string} lyricsUrl 
     * @param {string} artistUrl 
     * @param {string} searchUrl
     */
    constructor(title, artist, preview, lyricsUrl, artistUrl, searchUrl) {
        this.title = title;
        this.artist = artist;
        this.preview = preview;
        this.lyricsUrl = lyricsUrl;
        this.artistUrl = artistUrl;
        this.searchUrl = searchUrl;
        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this);
    }
}

class UtatenLyricsResult {
    /**
     * @param {string} title 
     * @param {string} artist 
     * @param {string} lyrics 
     * @param {string} lyricsUrl
     * @param {string} artistUrl 
     * @param {(string|null)} coverUrl 
     */
    constructor(title, artist, lyrics, lyricsUrl, artistUrl, coverUrl) {
        this.title = title;
        this.artist = artist;
        this.lyrics = lyrics;
        this.lyricsUrl = lyricsUrl;
        this.artistUrl = artistUrl;
        this.coverUrl = coverUrl;
        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this);
    }
}

class UtatenAPI {
    /**
     * @param {PipimiLogger} logger 
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * @param {string} url 
     * @returns {Promise<UtatenLyricsResult>}
     */
    async fetchLyrics(url) {
        const dom = await this._fetchDom(url);
        const document = dom.window.document;
        const titleNode = document.querySelector(".newLyricTitle__main").childNodes[0];
        const lyricsNode = document.querySelector(".hiragana");
        const coverNode = document.querySelector(".lyricData__sub img");
        const artistNode = document.querySelector(".newLyricWork__name a");

        // clean furigana
        Array.from(lyricsNode.querySelectorAll(".rt")).forEach(furigana => furigana.textContent = "");

        const title = this._cleanTitle(titleNode.textContent.trim());
        const lyrics = lyricsNode.textContent.trim();
        const artist = artistNode.textContent.trim();
        const artistUrl = ORIGIN + artistNode.href.trim();
        const coverUrl = this._cleanCoverUrl(coverNode.src.trim());

        return new UtatenLyricsResult(title, artist, lyrics, url, artistUrl, coverUrl);
    }

    /**
     * @param {UtatenSearchQuery} query 
     * @returns {Promise<UtatenSearchResult[]>}
     */
    async searchLyrics(query) {
        const params = new URLSearchParams();
        if (query.title) params.append("title", query.title);
        if (query.artist) params.append("artist_name", query.artist);
        const searchUrl = `${ORIGIN}${SEARCH_PATH}?${params.toString()}`;
        const dom = await this._fetchDom(searchUrl);

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
                return new UtatenSearchResult(title, artist, preview, lyricsUrl, artistUrl, searchUrl);
            });
    }

    /**
     * @param {string} url 
     * @returns {Promise<JSDOM>}
     */
    async _fetchDom(url) {
        this.logger.debug(() => `Fetching ${url}`);
        const response = await axios.get(url);
        this.logger.debug(() => `Got response from ${url}`, response.data);
        return new JSDOM(response.data);
    }

    /**
     * @param {string} title 
     * @returns {(string|null)}
     */
    _cleanTitle(title) {
        if (title.startsWith("「") && title.endsWith("」")) {
            return title.substring(1, title.length - 1);
        }
        return title;
    }

    /**
     * @param {string} coverUrl 
     * @returns {(string|null)}
     */
    _cleanCoverUrl(coverUrl) {
        if (coverUrl === "/images/common/noImage/lyric/300_300.png") {
            return null;
        }
        if (coverUrl.startsWith("/")) {
            return ORIGIN + coverUrl;
        }
        return coverUrl;
    }
}


const main = async argv => {
    const string = argv[2];
    const json = JSON.parse(string);
    const query = new UtatenSearchQuery(json.title, json.artist);
    const api = new UtatenAPI(new ConsoleLogger());
    const search = await api.searchLyrics(query);
    const lyrics = await api.fetchLyrics(search[0].lyricsUrl);
    console.log(JSON.stringify(lyrics.lyrics, null, 2));
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main(process.argv);
}

export { UtatenAPI, UtatenSearchQuery, UtatenSearchResult, UtatenLyricsResult };