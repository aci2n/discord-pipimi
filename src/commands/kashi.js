import { PipimiCommand } from "../framework/command.js";
import { UtatenAPI, UtatenQuery } from "../kashi/utaten.js";

/**
 * @returns {PipimiCommand[]}
 */
const getKashiCommands = () => {
    return [PipimiCommand.standard("kashi", [], async (context, args) => {
        const { logger, message } = context;
        const { channel } = message;
        const query = UtatenQuery.fromString(args.trim());
        const api = new UtatenAPI(logger);

        logger.trace(() => `Searching lyrics for '${query}'`);
        const searchResults = await api.searchLyrics(query);

        if (searchResults.length === 0) {
            logger.trace(() => `No search results for '${query}'`);
            await channel.send(`No search results for '${query}'.`);
            return context;
        }

        const [firstSearchResult] = searchResults;

        logger.trace(() => `Fetching lyrics`, firstSearchResult);
        const lyricsResult = await api.fetchLyrics(firstSearchResult.lyricsUrl);
        logger.trace(() => `Got lyrics`, lyricsResult);

        const output = `**${lyricsResult.title}**の歌詞（${lyricsResult.artist}）\n\n${lyricsResult.lyrics}`;
        await channel.send(output);
        return context;
    })];
};

export { getKashiCommands };
