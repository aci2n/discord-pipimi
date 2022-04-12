import { PipimiCommand } from "../framework/command.js";
import { UtatenAPI, UtatenLyricsResult, UtatenSearchQuery, UtatenSearchResult } from "../kashi/utaten.js";

/**
 * @returns {PipimiCommand[]}
 */
const getKashiCommands = () => {
    return [PipimiCommand.standard("kashi", [], async (context, args) => {
        const { logger, message } = context;
        const { channel } = message;
        const query = UtatenSearchQuery.fromString(args.trim());
        const api = new UtatenAPI(logger);
        const commandStart = Date.now();

        channel.send(`Searching lyrics for \`${query}\`…`); // don't wait
        const searchStart = Date.now();
        const searchResults = await api.searchLyrics(query);
        const searchElapsed = Date.now() - searchStart;
        logger.trace(() => `Lyrics search took ${searchElapsed}ms`, searchResults);

        if (searchResults.length === 0) {
            await channel.send(`No search results for '${query}'.`);
            return context;
        }

        channel.send(formatSearchResults(searchResults)); // don't wait

        const lyricsStart = Date.now();
        const lyricsResult = await api.fetchLyrics(searchResults[0].lyricsUrl);
        const lyricsElapsed = Date.now() - lyricsStart;
        logger.trace(() => `Got lyrics in ${lyricsElapsed}ms`, lyricsResult);

        await channel.send(formatLyricsResult(lyricsResult, Date.now() - commandStart));
        return context;
    })];
};

/**
 * @param {UtatenSearchResult[]} results
 * @returns {string}
 */
const formatSearchResults = (results) => {
    const lines = [];
    lines.push(`Got ${results.length} results!`);
    for (const result of results) {
        lines.push(`- ${result.title} (${result.artist}) <${result.lyricsUrl}>`);
    }
    lines.push(`Fetching lyrics for the first result: ${results[0].title} (${results[0].artist})…`);
    return lines.join("\n");
};

/**
 * @param {UtatenLyricsResult} result 
 * @param {number} elapsed 
 * @returns {string[]}
 */
const formatLyricsResult = (result, elapsed) => {
    const lines = [];
    lines.push(`**Title**: ${result.title} (<${result.lyricsUrl}>)`);
    lines.push(`**Artist**: ${result.artist} (<${result.artistUrl}>)`);
    if (result.coverUrl) {
        lines.push(`**Cover**: ${result.coverUrl}`);
    }
    lines.push(`*done in ${elapsed}ms*`);
    lines.push("");
    lines.push(result.lyrics);
    return lines.join("\n");
};


export { getKashiCommands };