import { Message } from "discord.js";

const ROLE_WHITELIST = new Set(["sudoers"]);
const COMMAND_PREFIX = "!eval";

/**
 * @param {Message} message 
 */
const handleEval = async (message) => {
    if (message.content.startsWith(COMMAND_PREFIX) && hasWhitelistedRole(message.member)) {
        try {
            const expr = message.content.substring(COMMAND_PREFIX.length).trim();

            if (!expr) {
                console.log("ignoring eval");
                return;
            }

            console.log("evaluating javascript", expr);
            const result = eval(expr);
            await message.channel.send(result);
        } catch (e) {
            console.error("could not evaluate expression", e);
            await message.channel.send("Could not evaluate expression");
        }
    }
};

const hasWhitelistedRole = member => {
    return member.roles.cache.find(r => ROLE_WHITELIST.has(r.name));
}

export { handleEval };
