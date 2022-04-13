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
        const start = Date.now();

        const [searchResults] = await Promise.all([
            api.searchLyrics(query),
            channel.send(`Searching lyrics for \`${query}\`…`)
        ]);

        if (searchResults.length === 0) {
            await channel.send(`No search results for \`${query}\`.`);
            return context;
        }

        const [lyricsResult] = await Promise.all([
            api.fetchLyrics(searchResults[0].lyricsUrl),
            channel.send(formatSearchResults(searchResults))
        ]);

        await channel.send(formatLyricsResult(lyricsResult, Date.now() - start));
        return context;
    })];
};

/**
 * @param {UtatenSearchResult[]} results
 * @returns {string}
 */
const formatSearchResults = results => {
    const lines = [];
    const [first] = results;
    const limit = 5;
    lines.push(`Got ${results.length} results! <${first.searchUrl}>`);
    if (results.length > limit) {
        lines.push(`*(Showing only top ${limit} results)*`);
    }
    for (const result of results.slice(0, limit)) {
        lines.push(`- \`${result.title} (${result.artist})\` <${result.lyricsUrl}>`);
    }
    lines.push(`Fetching lyrics for the first result: \`${first.title} (${first.artist})\`…`);
    return lines.join("\n");
};

/**
 * @param {UtatenLyricsResult} result 
 * @param {number} elapsed 
 * @returns {string}
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