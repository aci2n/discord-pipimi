import { GuildMember, Message, TextChannel } from "discord.js";

const ROLE_WHITELIST = new Set(["Sergeant"]);
const JAIL_CHANNEL_ID = "885247701019676732";
const COMMAND_PREFIX = "!carcel";
const PERSONALIZED_MESSAGES = new Map([
    ["957017010129235989", "adios mosca"],
    ["94885721948561408", "<:poque:660633228536971265>"]
]);

/**
 * @param {Message} message 
 */
const handleSergeantCommand = (message) => {
    if (message.content.startsWith(COMMAND_PREFIX) && hasWhitelistedRole(message.member)) {
        message.mentions.members.forEach(member => moveToJail(member.id, member.voice, message.channel));
    }
};

/**
 * @param {Snowflake} memberId
 * @param {VoiceState} voiceState
 * @param {TextChannel} textChannel
 */
const moveToJail = async (memberId, voiceState, textChannel) => {
    if (!voiceState.channelID || voiceState.channelID === JAIL_CHANNEL_ID) {
        console.log("ignoring jail command", memberId);
        return;
    }

    console.log("sending user to jail", memberId);

    try {
        await voiceState.setChannel(JAIL_CHANNEL_ID);
    } catch (e) {
        console.error("failed to send user to jail", memberId, e)
        return;
    }

    const message = PERSONALIZED_MESSAGES.has(memberId)
        ? PERSONALIZED_MESSAGES.get(memberId)
        : "👮";

    try {
        await textChannel.send(message);
    } catch (e) {
        console.error("could not send message", memberId, e);
    }
};

/**
 * @param {GuildMember} member 
 */
const hasWhitelistedRole = member => {
    return member.roles.cache.find(r => ROLE_WHITELIST.has(r.name));
}

export { handleSergeantCommand };