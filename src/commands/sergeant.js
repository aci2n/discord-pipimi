import { GuildMember, VoiceState } from "discord.js";
import { PipimiCommand } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getSergeantCommands = () => {
    const jailChannelId = "885247701019676732";
    const customMessages = new Map([
        ["957017010129235989", "adios mosca"],
        ["94885721948561408", "<:poque:660633228536971265>"]
    ]);

    return [PipimiCommand.standard("carcel", ["Sergeant"], async context => {
        const { message, logger } = context;
        const { mentions, client, guild, channel } = message;

        /** @type {string[]} */
        const movedIds = [];

        for (const user of mentions.users.values()) {
            const member = await new GuildMember(client, { user }, guild).fetch();

            try {
                logger.trace(() => `About to move user '${member.id}' to jail`);
                if (await moveToChannel(member.voice, jailChannelId)) {
                    movedIds.push(member.id);
                } else {
                    logger.debug(() => `User '${member.id}' was not moved (not in voice or already in jail?)`);
                }
            } catch (e) {
                logger.error(() => `Failed to move user '${member.id}': ${e}`);
                await channel.send(`Failed to move user.`);
                return context;
            }
        }

        if (movedIds.length > 0) {
            const customId = movedIds.find(id => customMessages.has(id));
            if (customId) {
                logger.trace(() => `Sending custom jail message for user '${customId}': '${customMessages.get(customId)}'`);
            }
            await channel.send(customId ? customMessages.get(customId) : "👮");
        }

        return context;
    })]
};

/**
 * @param {VoiceState} voiceState
 * @param {string} channelId
 */
const moveToChannel = async (voiceState, channelId) => {
    if (!voiceState.channelID || voiceState.channelID === channelId) {
        return false;
    }
    await voiceState.setChannel(channelId);
    return true;
};

export { getSergeantCommands };