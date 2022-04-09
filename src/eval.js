const ROLE_WHITELIST = new Set(["sudoers"]);
const COMMAND_PREFIX = "!eval";

const handleEval = async (message) => {
    if (message.content.startsWith(COMMAND_PREFIX) && hasWhitelistedRole(message.member)) {
        try {
            const [, expr] = message.content.split(" ", 2);
            const result = eval(expr);
            await message.channel.send(result);
        } catch (e) {
            console.error("could not evaluate expression", message);
            await message.channel.send("Could not evaluate expression");
        }
    }
};

const hasWhitelistedRole = member => {
    return member.roles.cache.find(r => ROLE_WHITELIST.has(r.name));
}

export { handleEval };
