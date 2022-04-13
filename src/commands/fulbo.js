import axios from "axios";
import { JSDOM } from "jsdom";
import { PipimiCommand, PipimiContext } from "../framework/command.js";
import { PipimiLogger } from "../framework/logger.js";

const ORIGIN = "https://www.espn.com.ar";
const clubImage = (id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${id}.png&w=40&h=40&scale=crop&cquality=40&location=origin`;

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

    const lines = [clubImage(teamId)];
    for (const match of nextMatches.slice(0, 5)) {
        lines.push(`[${match.condition}] ${match.date} vs ${match.rival} a las ${match.hour} (${match.tournament}).`);
    }

    await channel.send(lines.join("\n"));
    return context;
};

/**
 * @param {number} teamId 
 * @param {PipimiLogger} logger 
 * @returns {Promise<{date: string, condition: ("L"|"V"), rival: string}>}
 */
const getNextMatches = async (teamId, logger) => {
    const url = `${ORIGIN}/futbol/equipo/calendario/_/id/${teamId}`;
    logger.debug(() => `Getting next matches from ${url}`);
    const response = await axios.get(url);
    logger.debug(() => `Got result from espn`, response.headers);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const matches = [];
    const rows = document.querySelectorAll(".Table__TR--sm");
    for (const row of Array.from(rows)) {
        const [dateNode, homeNode, _, awayNode, hourNode, tournamentNode] = Array.from(row.children);
        const date = dateNode.textContent.trim();
        const homeId = Number.parseInt(homeNode.querySelector("a.Table__Team").href.trim().match(/\/id\/(\d+)/)[1]);
        const home = homeNode.textContent.trim();
        const condition = homeId === teamId ? "L" : "V";
        const away = awayNode.textContent.trim();
        const hour = hourNode.textContent.trim();
        const tournament = tournamentNode.textContent.trim();
        matches.push({ date, condition, rival: condition === "L" ? away : home, hour, tournament });
    }

    return matches;
};

export { getFulboCommands };
