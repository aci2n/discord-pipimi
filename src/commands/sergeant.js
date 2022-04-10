import { GuildMember, VoiceState } from "discord.js";
import { PipimiCommand, PipimiResponse } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getSergeantCommands = () => {
    const jailChannelId = "885247701019676732";
    const customMessages = new Map([
        ["957017010129235989", "adios mosca"],
        ["94885721948561408", "<:poque:660633228536971265>"]
    ]);

    return [PipimiCommand.standard("!carcel", ["Sergeant"], async context => {
        const { message } = context;

        /** @type {string[]} */
        const movedIds = [];

        for (const user of message.mentions.users.values()) {
            const member = await new GuildMember(message.client, { user }, message.guild).fetch();

            try {
                if (await moveToChannel(member.voice, jailChannelId)) {
                    movedIds.push(member.id);
                }
            } catch (e) {
                return PipimiResponse.error(`Failed to move user '${member.id}'`, e);
            }
        }

        if (movedIds.length === 0) {
            return PipimiResponse.empty();
        }

        const customId = movedIds.find(id => customMessages.has(id));
        return PipimiResponse.send(customId ? customMessages.get(customId) : "👮");
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