import axios from "axios";
import { JSDOM } from "jsdom";
import { PipimiCommand, PipimiContext } from "../framework/command.js";
import { PipimiLogger } from "../framework/logger.js";

/**
 * @returns {PipimiCommand[]}
 */
const getFulboCommands = () => {
    const command = (aliases, teamId) =>
        PipimiCommand.prefixed(aliases, [], (context, _args) => sendNextMatches(context, teamId));

    return [
        command(["river", "rivercito"], 16),
        command(["boca", "boquita"], 5),
        command(["aldosivi", "tiburon"], 9739),
        PipimiCommand.prefixed(["fixture"], [], (context, args) => sendNextMatches(context, Number.parseInt(args))),
    ];
};

/**
 * @param {PipimiContext} context 
 * @param {number} teamId 
 * @returns {Promise<PipimiContext>}
 */
const sendNextMatches = async (context, teamId) => {
    const { message, logger } = context;
    const { channel } = message;

    if (isNaN(teamId)) {
        await channel.send(`Invalid team id: \`${teamId}\``);
        return context;
    }

    const nextMatches = await getNextMatches(teamId, logger);

    if (nextMatches.length === 0) {
        await channel.send("No pending matches found.");
        return context;
    }

    const lines = [`https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${teamId}.png&w=100&h=100`];

    for (const match of nextMatches.slice(0, 5)) {
        lines.push(`- ${match.home} vs ${match.away} [${match.date} ${match.time}] (${match.tournament}) <${match.url}>`);
    }

    await channel.send(lines.join("\n"));
    return context;
};

/**
 * @param {number} teamId 
 * @param {PipimiLogger} logger 
 * @returns {Promise<[{home: string, away: string, date: string, time: (string|null), tournament: string, url: string}]>}
 */
const getNextMatches = async (teamId, logger) => {
    const origin = "https://www.espn.com.ar";
    const url = `${origin}/futbol/equipo/calendario/_/id/${teamId}`;
    logger.debug(() => `Getting next matches from ${url}`);
    const response = await axios.get(url);
    logger.debug(() => `Got result from espn`, response.headers);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const matches = [];

    for (const matchNode of Array.from(document.querySelectorAll(".Table__TR--sm"))) {
        const [dateNode, homeNode, _, awayNode, timeNode, tournamentNode] = Array.from(matchNode.children);

        const home = homeNode.textContent.trim();
        const away = awayNode.textContent.trim();
        const date = dateNode.textContent.trim();
        const time = timeNode.textContent.trim();
        const tournament = tournamentNode.textContent.trim();
        const url = origin + timeNode.querySelector("a").href.trim();

        matches.push({ home, away, date, time, tournament, url });
    }

    return matches;
};

export { getFulboCommands };
