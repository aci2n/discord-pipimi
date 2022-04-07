import { GuildMember } from "discord.js";

const ROLE_WHITELIST = new Set(["Sergeant"]);
const JAIL_CHANNEL_ID = "885247701019676732";
const COMMAND_PREFIX = "!carcel";

const processSergeant = (client, message) => {
    if (message.content.startsWith(COMMAND_PREFIX) && hasWhitelistedRole(message.member)) {
        const users = message.mentions.users.values();

        for (const user of users) {
            const gm = new GuildMember(client, { user }, message.guild);
            gm.voice.setChannel(JAIL_CHANNEL_ID);
        }
    }
};

const hasWhitelistedRole = member => {
    return member.roles.cache.find(r => ROLE_WHITELIST.has(r.name));
}

export { processSergeant };