import axios from "axios";
import { JSDOM } from "jsdom";
import { PipimiCommand, PipimiContext } from "../framework/command.js";
import { PipimiLogger } from "../framework/logger.js";

const ORIGIN = "https://www.promiedos.com.ar";

/**
 * @returns {PipimiCommand[]}
 */
const getFulboCommands = () => {
    const handler = teamId => (context, _args) => sendNextMatches(context, teamId);
    const river = handler(18);
    const boca = handler(22);
    const aldosivi = handler(6);

    return [
        PipimiCommand.standard("river", [], river),
        PipimiCommand.standard("rivercito", [], river),
        PipimiCommand.standard("boca", [], boca),
        PipimiCommand.standard("boquita", [], boca),
        PipimiCommand.standard("aldosivi", [], aldosivi),
        PipimiCommand.standard("tiburon", [], aldosivi),
        PipimiCommand.standard("fixture", [], (context, args) => sendNextMatches(context, Number.parseInt(args))),
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
    }

    const lines = [`${ORIGIN}/images/64/${teamId}.png`];
    for (const match of nextMatches.slice(0, 5)) {
        lines.push(`- [${match.condition}] ${match.date} vs ${match.rival}`);
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
    const url = `${ORIGIN}/club=${teamId}`;
    logger.debug(() => `Getting next matches from ${url}`);
    const response = await axios.get(url);
    logger.debug(() => `Got result from promiedos`, response.headers);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const matches = [];

    for (let match = document.querySelector(".sj").parentElement; match; match = match.nextElementSibling) {
        const [dateNode, _, conditionNode, rivalNode] = Array.from(match.children);
        const date = dateNode.textContent.trim();
        const condition = conditionNode.textContent.trim();
        const rival = rivalNode.textContent.trim();
        matches.push({ date, condition, rival });
    }

    return matches;
};

export { getFulboCommands };
