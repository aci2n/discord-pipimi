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
        const { message } = context;
        const { mentions, client, guild, channel } = message;

        /** @type {string[]} */
        const movedIds = [];

        for (const user of mentions.users.values()) {
            const member = await new GuildMember(client, { user }, guild).fetch();

            try {
                if (await moveToChannel(member.voice, jailChannelId)) {
                    movedIds.push(member.id);
                }
            } catch (e) {
                console.log("Failed to move user", e);
                await channel.send(`Failed to move user.`);
                return context;
            }
        }

        if (movedIds.length > 0) {
            const customId = movedIds.find(id => customMessages.has(id));
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